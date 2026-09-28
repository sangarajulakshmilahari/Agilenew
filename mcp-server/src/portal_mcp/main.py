from __future__ import annotations

from .config import load_settings
from .server import create_server


def run() -> None:
    settings = load_settings()
    server = create_server(settings)

    transport = settings.mcp_transport.lower()
    if transport == "streamable-http":
        server.run(
            "streamable-http",
            host=settings.mcp_host,
            port=settings.mcp_port,
            streamable_http_path=settings.mcp_path,
        )
        return

    if transport == "sse":
        server.run(
            "sse",
            host=settings.mcp_host,
            port=settings.mcp_port,
            sse_path="/sse",
            message_path="/messages/",
        )
        return

    if transport == "stdio":
        server.run("stdio")
        return

    raise ValueError("MCP_TRANSPORT must be one of: streamable-http, sse, stdio")


if __name__ == "__main__":
    run()

