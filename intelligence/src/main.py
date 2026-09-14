"""Service entrypoint for running the intelligence microservice."""

import os
import uvicorn
from intelligence.src.app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("intelligence.src.main:app", host=host, port=port, reload=False)
