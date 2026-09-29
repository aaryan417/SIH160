const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Creates a valid synthetic PCAP binary buffer (24-byte pcap global header
 * + synthetic IKE/ESP packet records) so users can test parsing & AI classification
 * immediately without having to capture live VPN packets from Wireshark.
 */
export function createSyntheticPcapBlob(cipherType = "AES-GCM", packetCount = 24) {
  // PCAP Global Header (24 bytes, standard libpcap format, little-endian)
  // Magic: 0xa1b2c3d4, v2.4, thiszone=0, sigfigs=0, snaplen=65535, network=1 (LINKTYPE_ETHERNET)
  const globalHeader = new Uint8Array([
    0xd4, 0xc3, 0xb2, 0xa1, // magic_number (0xa1b2c3d4 little-endian)
    0x02, 0x00,             // version_major (2)
    0x04, 0x00,             // version_minor (4)
    0x00, 0x00, 0x00, 0x00, // thiszone (0)
    0x00, 0x00, 0x00, 0x00, // sigfigs (0)
    0xff, 0xff, 0x00, 0x00, // snaplen (65535)
    0x01, 0x00, 0x00, 0x00  // network (1 = LINKTYPE_ETHERNET)
  ]);

  const packetBuffers = [];
  const baseTimestamp = Math.floor(Date.now() / 1000) - 300;

  for (let i = 0; i < packetCount; i++) {
    const isIKE = i < 4; // first 4 packets simulated as IKEv2 negotiation (UDP 500)
    const isOutbound = i % 2 === 0;
    const srcIpBytes = isOutbound ? [10, 0, 0, 2] : [10, 0, 0, 1];
    const dstIpBytes = isOutbound ? [10, 0, 0, 1] : [10, 0, 0, 2];

    // Payload size: ESP packets vary between 128 to 1420 bytes
    const payloadLen = isIKE ? 340 : (160 + ((i * 47) % 700));
    const ipTotalLen = 20 + (isIKE ? 8 + payloadLen : payloadLen); // 20 byte IP + transport
    const ethPacketLen = 14 + ipTotalLen; // 14 byte Ethernet header

    // 16-byte PCAP packet record header:
    // ts_sec (4B), ts_usec (4B), incl_len (4B), orig_len (4B)
    const recordHeader = new Uint8Array(16);
    const view = new DataView(recordHeader.buffer);
    const tsSec = baseTimestamp + Math.floor(i * 0.4);
    const tsUsec = (i * 250000) % 1000000;
    view.setUint32(0, tsSec, true);
    view.setUint32(4, tsUsec, true);
    view.setUint32(8, ethPacketLen, true);
    view.setUint32(12, ethPacketLen, true);

    // Construct Ethernet + IP + Protocol packet body
    const packetData = new Uint8Array(ethPacketLen);

    // Ethernet Header: Dst MAC (6B), Src MAC (6B), EtherType IPv4 0x0800 (2B)
    packetData.set([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0x08, 0x00], 0);

    // IPv4 Header (20 bytes)
    packetData[14] = 0x45; // Version 4, IHL 5
    packetData[15] = 0x00; // DSCP / ECN
    packetData[16] = (ipTotalLen >> 8) & 0xff;
    packetData[17] = ipTotalLen & 0xff;
    packetData[18] = 0x12; packetData[19] = i & 0xff; // ID
    packetData[20] = 0x40; packetData[21] = 0x00;     // Flags: Don't Fragment
    packetData[22] = 64;                             // TTL
    packetData[23] = isIKE ? 17 : 50;                // Protocol: 17=UDP, 50=ESP
    packetData[24] = 0x00; packetData[25] = 0x00;     // Checksum (zero for simulation)
    packetData.set(srcIpBytes, 26);
    packetData.set(dstIpBytes, 30);

    if (isIKE) {
      // UDP Header (8 bytes): src_port=500, dst_port=500
      packetData[34] = 0x01; packetData[35] = 0xf4; // 500
      packetData[36] = 0x01; packetData[37] = 0xf4; // 500
      const udpLen = 8 + payloadLen;
      packetData[38] = (udpLen >> 8) & 0xff;
      packetData[39] = udpLen & 0xff;
    }

    packetBuffers.push(recordHeader, packetData);
  }

  return new Blob([globalHeader, ...packetBuffers], { type: "application/vnd.tcpdump.pcap" });
}

export const api = {
  checkHealth: () => request("/health"),

  listConfigurations: () => request("/testbed/configurations"),
  createConfiguration: (payload) =>
    request("/testbed/configurations", { method: "POST", body: JSON.stringify(payload) }),

  uploadCapture: (configId, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/capture/sessions/${configId}`, { method: "POST", body: form });
  },
  listCaptures: () => request("/capture/sessions"),
  getCapture: (sessionId) => request(`/capture/sessions/${sessionId}`),

  runClassification: (sessionId, localIp = "10.0.0.2") =>
    request(`/classify/${sessionId}?local_ip=${encodeURIComponent(localIp)}`, { method: "POST" }),

  runAssessment: (sessionId) => request(`/assess/${sessionId}`, { method: "POST" }),

  generateReport: (sessionId, reportType = "executive") =>
    request(`/reports/${sessionId}?report_type=${reportType}`, { method: "POST" }),
  getReport: (reportId) => request(`/reports/${reportId}`),

  /**
   * Helper to seed standard defense/NTRO reference configurations into the testbed.
   */
  async seedDemoData() {
    const presets = [
      {
        mode: "tunnel",
        cipher_suite: "AES-GCM",
        dh_group: "ECP384",
        pfs_enabled: true,
        ip_version: "IPv4",
      },
      {
        mode: "tunnel",
        cipher_suite: "3DES",
        dh_group: "MODP1024",
        pfs_enabled: false,
        ip_version: "IPv4",
      },
      {
        mode: "transport",
        cipher_suite: "AES-256",
        dh_group: "MODP2048",
        pfs_enabled: true,
        ip_version: "IPv6",
      },
    ];

    const createdConfigs = [];
    for (const p of presets) {
      const cfg = await api.createConfiguration(p);
      createdConfigs.push(cfg);
    }
    return createdConfigs;
  },
};
