import { getCommsConfig, saveCommsConfig } from '../storage.js';
import { resolveTargetContainer } from './agency.switcher.js';

export function renderDeveloperView(container) {
  renderDeveloperOverview(container);
}

export function renderDeveloperOverview(container) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const config = getCommsConfig();
  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f4a4b8; color: #12151c; border: 1px solid #db7093; border-left: 5px solid #10b981; border-radius: 4px; padding: 1.15rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.2);">
      <div style="border-bottom: 2px solid #10b981; padding-bottom: 0.5rem;">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.15rem; letter-spacing: 0.03em; color: #12151c;">
          Model Context Protocol (MCP) & MCP Servers Configuration
        </h3>
        <p style="font-size: 0.85rem; color: #12151c; margin: 0.35rem 0 0; opacity: 0.9;">
          Connect your local AI assistants and MCP servers directly to your workspace.
        </p>
      </div>

      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.35rem;">
        <label for="dev-mcp-endpoint" style="font-weight: bold; font-size: 0.85rem; color: #12151c;">
          MCP Endpoint URL
        </label>
        <input
          type="text"
          id="dev-mcp-endpoint"
          value="${config.mcpEndpoint || ''}"
          placeholder="https://..."
          style="width: 100%; padding: 0.45rem 0.6rem; background: #fff5f7; color: #12151c; border: 1px solid #10b981; border-radius: 3px; font-family: monospace; font-size: 0.88rem; box-sizing: border-box;"
        />
      </div>

      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.35rem;">
        <label for="dev-api-token" style="font-weight: bold; font-size: 0.85rem; color: #12151c;">
          Secure API Token
        </label>
        <input
          type="text"
          id="dev-api-token"
          value="${config.apiKey || ''}"
          placeholder="Enter token..."
          style="width: 100%; padding: 0.45rem 0.6rem; background: #fff5f7; color: #12151c; border: 1px solid #10b981; border-radius: 3px; font-family: monospace; font-size: 0.88rem; box-sizing: border-box;"
        />
      </div>

      <div class="form-group" style="margin-top: 0.25rem;">
        <button
          type="button"
          id="save-dev-config-btn"
          class="primary-btn dossier-btn"
          style="background: #10b981; color: #12151c; border: 1px solid #059669; padding: 0.55rem 1.1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.04em; border-radius: 3px; cursor: pointer; font-weight: bold; box-shadow: 2px 2px 0px #12151c;"
        >
          Save Developer Configuration
        </button>
      </div>
    </div>
  `;

  const saveBtn = target.querySelector('#save-dev-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const mcpEndpoint = document.getElementById('dev-mcp-endpoint').value;
      const apiKey = document.getElementById('dev-api-token').value;
      const current = getCommsConfig();
      current.mcpEndpoint = mcpEndpoint;
      current.apiKey = apiKey;
      saveCommsConfig(current);
      alert('Developer configuration successfully saved!');
    });
  }
}