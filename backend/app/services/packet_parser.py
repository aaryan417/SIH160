"""Parses a pcap file and extracts IKE / ESP / AH packet-level metadata.

We never touch encrypted payloads here — IPsec traffic is opaque by design.
Everything extracted is header/metadata: sizes, timing, SPI values, IKE
exchange types where visible. That metadata is what the classifier in
protocol_classifier.py learns from.
"""

from dataclasses import dataclass, field

from scapy.all import IP, UDP, rdpcap
from scapy.layers.ipsec import AH, ESP

IKE_PORTS = {500, 4500}
AH_PROTO_NUMBER = 51
ESP_PROTO_NUMBER = 50


@dataclass
class ParsedPacket:
    protocol: str  # IKE | ESP | AH | OTHER
    direction: str  # inbound | outbound
    length: int
    timestamp: float
    ike_version: str | None = None
    spi: str | None = None


@dataclass
class ParsedCapture:
    packets: list[ParsedPacket] = field(default_factory=list)

    def counts_by_protocol(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for pkt in self.packets:
            counts[pkt.protocol] = counts.get(pkt.protocol, 0) + 1
        return counts


def _direction(src_ip: str, local_ip: str) -> str:
    return "outbound" if src_ip == local_ip else "inbound"


def parse_pcap(pcap_path: str, local_ip: str) -> ParsedCapture:
    """Reads a pcap and classifies each packet as IKE, ESP, AH, or other.

    local_ip identifies which endpoint is "ours" so direction can be tagged —
    pass the testbed's own interface IP for lab captures.
    """
    result = ParsedCapture()
    packets = rdpcap(pcap_path)

    for pkt in packets:
        if IP not in pkt:
            continue

        ip_layer = pkt[IP]
        direction = _direction(ip_layer.src, local_ip)
        length = len(pkt)
        timestamp = float(pkt.time)

        if UDP in pkt and pkt[UDP].dport in IKE_PORTS or (UDP in pkt and pkt[UDP].sport in IKE_PORTS):
            # IKE header: first byte pair after the SPI fields carries the
            # major/minor version. We keep this best-effort — a malformed
            # or NAT-T-wrapped packet just gets ike_version=None.
            ike_version = None
            payload = bytes(pkt[UDP].payload)
            if len(payload) >= 18:
                ike_version = f"{payload[17] >> 4}.{payload[17] & 0x0F}"
            result.packets.append(
                ParsedPacket(protocol="IKE", direction=direction, length=length,
                             timestamp=timestamp, ike_version=ike_version)
            )
        elif ESP in pkt:
            spi = f"{pkt[ESP].spi:#010x}"
            result.packets.append(
                ParsedPacket(protocol="ESP", direction=direction, length=length,
                             timestamp=timestamp, spi=spi)
            )
        elif AH in pkt or ip_layer.proto == AH_PROTO_NUMBER:
            result.packets.append(
                ParsedPacket(protocol="AH", direction=direction, length=length, timestamp=timestamp)
            )
        else:
            result.packets.append(
                ParsedPacket(protocol="OTHER", direction=direction, length=length, timestamp=timestamp)
            )

    return result
