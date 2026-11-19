import { getCommsConfig, saveCommsConfig } from '../storage.js';
import { resolveTargetContainer } from './agency.switcher.js';

export function renderAutomationsView(container) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const config = getCommsConfig();
  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f4a4b8; color: #12151c; border: 1px solid #db7093; border-left: 5px solid #10b981; border-radius: 4px; padding: 1.15rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.2);">
      <div style="border-bottom: 2px solid #10b981; padding-bottom: 0.5rem;">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.15rem; letter-spacing: 0.03em; color: #12151c;">
          Messaging Relays (Telegram & Discord)
        </h3>
        <p style="font-size: 0.85rem; color: #12151c; margin: 0.35rem 0 0; opacity: 0.9;">
          Configure your external handler notifications and webhook bots.
        </p>
      </div>

      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.35rem;">
        <label for="comms-tg-token" style="font-weight: bold; font-size: 0.85rem; color: #12151c;">
          Telegram Bot Token
        </label>
        <input
          type="text"
          id="comms-tg-token"
          value="${config.telegramToken || ''}"
          placeholder="123456:ABC-DEF..."
          style="width: 100%; padding: 0.45rem 0.6rem; background: #fff5f7; color: #12151c; border: 1px solid #10b981; border-radius: 3px; font-family: monospace; font-size: 0.88rem; box-sizing: border-box;"
        />
      </div>

      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.35rem;">
        <label for="comms-tg-chat" style="font-weight: bold; font-size: 0.85rem; color: #12151c;">
          Telegram Chat ID
        </label>
        <input
          type="text"
          id="comms-tg-chat"
          value="${config.telegramChatId || ''}"
          placeholder="-100..."
          style="width: 100%; padding: 0.45rem 0.6rem; background: #fff5f7; color: #12151c; border: 1px solid #10b981; border-radius: 3px; font-family: monospace; font-size: 0.88rem; box-sizing: border-box;"
        />
      </div>

      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.35rem;">
        <label for="comms-desc-webhook" style="font-weight: bold; font-size: 0.85rem; color: #12151c;">
          Discord Webhook URL
        </label>
        <input
          type="text"
          id="comms-desc-webhook"
          value="${config.discordWebhook || ''}"
          placeholder="https://discord.com/api/webhooks/..."
          style="width: 100%; padding: 0.45rem 0.6rem; background: #fff5f7; color: #12151c; border: 1px solid #10b981; border-radius: 3px; font-family: monospace; font-size: 0.88rem; box-sizing: border-box;"
        />
      </div>

      <div class="form-group" style="margin-top: 0.25rem;">
        <button
          type="button"
          id="save-comms-config-btn"
          class="primary-btn dossier-btn"
          style="background: #10b981; color: #12151c; border: 1px solid #059669; padding: 0.55rem 1.1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.04em; border-radius: 3px; cursor: pointer; font-weight: bold; box-shadow: 2px 2px 0px #12151c;"
        >
          Save Comms Relays
        </button>
      </div>
    </div>
  `;

  const saveBtn = target.querySelector('#save-comms-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const telegramToken = document.getElementById('comms-tg-token').value;
      const telegramChatId = document.getElementById('comms-tg-chat').value;
      const discordWebhook = document.getElementById('comms-desc-webhook').value;
      const current = getCommsConfig();
      current.telegramToken = telegramToken;
      current.telegramChatId = telegramChatId;
      current.discordWebhook = discordWebhook;
      saveCommsConfig(current);
      alert('Comms relay configuration successfully saved!');
    });
  }
}