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
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8f0ele;">Model Context Protocol (MCP) & MCP Servers Configuration</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Connect your local AI assistants and MCP servers directly to your workspace.</p>

      <div class="form-group">
        <label>MCP Endpoint URL</label>
        <input type="text" id="dev-mcp-endpoint" value="${config.mcpEndpoint || ''}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Secure API Token</label>
        <input type="text" id="dev-api-token" value="${config.apiKey || ''}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <button type="button" id="save-dev-config-btn" class="primary-btn dossier-btn">Save Developer Configuration</button>
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