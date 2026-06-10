# App 內 EULA 片段 — AI 助理（自帶金鑰）

> 供 Keeply app repo 後續 spec 取用（D45 工作包 B 產物，2026-06-10）。
> 與官網 `/terms` §14（spec 122）同源同義；app 端呈現時可拆段顯示。
> 標 [DRAFT-LEGAL] 之段落為起草給法務審的草稿，其餘為 2026-06-04 四方研究交叉驗證定稿。
> 紅線：不得暗示省訂閱費／一份錢用所有模型；中國服務商中性處理；不得宣稱未實作能力。

---

## zh-TW

### AI 金鑰的所有權與責任
你在 Keeply 填入的 AI 服務金鑰，僅用於**代表你本人**向對應 AI 服務商發送請求。所有用量與費用由你與該服務商直接結算；Keeply **不持有、不代管、不轉售**你的金鑰。

### 合法來源
請僅填入你本人或你的組織**合法取得**的金鑰。請勿填入來路不明、購買、共用或他人轉讓的金鑰；因違反 AI 服務商條款而導致的帳號風險，由你自行承擔。

### 不支援訂閱登入
Keeply 不支援、也不會協助你以消費級訂閱帳號（如 ChatGPT Plus、Claude Pro/Max、Gemini 進階版）進行自動化存取，以保護你的帳號不觸犯各家服務條款。

### AI 輸出與責任限制 [DRAFT-LEGAL]
AI 產生的內容（建議的修改、摘要、回答）可能不正確、不完整或不適用於你的情境。**套用任何 AI 建議前，你有責任自行審閱。**Keeply 的配套保護是：每一次 AI 修改都先以提案呈現、經你確認才套用，且可隨時從版本歷史一鍵還原。在適用法律允許的最大範圍內，Keeply 對 AI 產出內容造成的損失不承擔責任；任何責任均受授權協議既有責任限制條款約束。

### 已送出內容的刪除限制 [DRAFT-LEGAL]
內容一經送達你選擇的 AI 服務商，其保留與刪除即受該服務商的條款及適用法律管轄。Keeply 沒有伺服器副本，**無法代你刪除**已送出的內容。如需請求刪除，請直接聯繫你的服務商（例如 OpenAI、Anthropic、Google 的隱私頁面提供刪除請求入口）。若你使用本機模式，內容從未離開你的電腦，不涉及此問題。

### AI 編輯的標示
由 AI 助理產生並經你套用的修改，會在 Keeply 的版本歷史中標示為 AI 助理的編輯。
（紅隊修正：app 端引用時請以實際 UI 字串為準；不得加「與手動修改可明確區分」等未經 §1 背書的能力宣稱。）

---

## en

### Ownership of and Responsibility for Your AI Keys
The AI service keys you enter in Keeply are used solely to send requests to the corresponding AI provider **on your own behalf**. All usage and fees are settled directly between you and that provider; Keeply **does not hold, host, or resell** your keys.

### Lawful Source
Enter only keys that you or your organization obtained **lawfully**. Do not enter keys of unknown origin, or keys that were bought, shared, or transferred from someone else; account risks arising from violating an AI provider's terms are borne by you.

### No Subscription Login
Keeply does not support — and will not help you set up — automated access through consumer subscription accounts (such as ChatGPT Plus, Claude Pro/Max, or Gemini Advanced), to protect your account from violating those services' terms.

### AI Output and Limitation of Liability [DRAFT-LEGAL]
AI-generated content (suggested edits, summaries, answers) may be incorrect, incomplete, or unsuitable for your situation. **You are responsible for reviewing any AI suggestion before applying it.** Keeply's built-in safeguard: every AI edit is presented as a proposal first, applied only after you confirm it, and reversible at any time with one click from version history. To the maximum extent permitted by applicable law, Keeply is not liable for losses caused by AI-generated content; any liability is subject to the limitation-of-liability provisions of the license agreement.

### Deletion Limits for Content Already Sent [DRAFT-LEGAL]
Once content reaches the AI provider you selected, its retention and deletion are governed by that provider's terms and applicable law. Keeply keeps no server-side copy and **cannot delete** already-sent content on your behalf. To request deletion, contact your provider directly (the privacy pages of e.g. OpenAI, Anthropic, and Google offer deletion-request entry points). In local mode, content never left your computer, so this does not arise.

### Labeling of AI Edits
Edits produced by the AI assistant and applied by you are labeled as AI-assistant edits in Keeply's version history.
(Red-team note: when quoting in-app, use the actual UI string; do not add capability claims such as "clearly distinguishable" that §1 does not back.)
