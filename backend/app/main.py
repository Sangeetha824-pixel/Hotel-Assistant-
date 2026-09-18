import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO)

settings = get_settings()
app = FastAPI(title=settings.app_name, docs_url=None)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = Path(os.getenv("FRONTEND_DIST_DIR", PROJECT_ROOT / "frontend" / "dist"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/docs", include_in_schema=False)
async def custom_docs() -> HTMLResponse:
    swagger = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{settings.app_name} - API Docs",
        swagger_ui_parameters={"defaultModelsExpandDepth": -1},
    )
    html = swagger.body.decode("utf-8")
    html = html.replace("<html>", '<html lang="en">')
    html = html.replace(
        "</head>",
        """
    <meta name="description" content="API documentation for the Simplotel hotel guest assistant backend." />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      .swagger-ui .info .title small,
      .swagger-ui .info .title small pre,
      .swagger-ui .opblock.opblock-post .opblock-summary-method,
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        color: #ffffff !important;
      }
      .swagger-ui .info .title small {
        background: #4b5563 !important;
      }
      .swagger-ui .info .title small.version-stamp {
        background: #047857 !important;
      }
      .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: #047857 !important;
      }
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: #1d4ed8 !important;
      }
      .swagger-ui .model-toggle,
      .swagger-ui .expand-methods,
      .swagger-ui .expand-operation,
      .swagger-ui .opblock-summary-path,
      .swagger-ui .opblock-summary-description {
        min-height: 28px !important;
        line-height: 28px !important;
      }
      .swagger-ui .model-box .model-toggle::after,
      .swagger-ui .model-title,
      .swagger-ui .model .prop .prop-name,
      .swagger-ui .model .prop .prop-type,
      .swagger-ui .expand-methods,
      .swagger-ui .model-toggle {
        color: #374151 !important;
      }
    </style>
    <script>
      window.addEventListener("load", () => {
        document.documentElement.lang = "en";
        document.querySelectorAll("#operations-tag-default").forEach((heading) => {
          const replacement = document.createElement("h2");
          replacement.id = heading.id;
          replacement.className = heading.className;
          replacement.innerHTML = heading.innerHTML;
          heading.replaceWith(replacement);
        });
      });
    </script>
  </head>""",
    )
    return HTMLResponse(html)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/llms.txt", include_in_schema=False)
    async def llms_txt() -> FileResponse:
        return FileResponse(FRONTEND_DIST / "llms.txt", media_type="text/plain")

    @app.get("/robots.txt", include_in_schema=False)
    async def robots_txt() -> FileResponse:
        return FileResponse(FRONTEND_DIST / "robots.txt", media_type="text/plain")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str) -> FileResponse:
        requested_file = FRONTEND_DIST / full_path
        if full_path and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(FRONTEND_DIST / "index.html")
