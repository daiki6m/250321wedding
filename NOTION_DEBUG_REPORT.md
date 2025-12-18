# Notion連携修正レポート

Notionのデータが正しく反映されない問題について、原因の調査と修正を行いました。

## 1. 原因
NotionのAPIから返ってくるデータの「型（Type）」が、スクリプトが想定していたものと一部異なっていた、または柔軟に対応できていなかったことが原因でした。
特に、Notionでは同じ「テキスト」に見えても、内部的には `title` (タイトル), `rich_text` (テキスト), `select` (セレクト), `number` (数値) など様々な型があり、それぞれデータの取り出し方が異なります。

## 2. 修正内容

### `scripts/fetch-guests.js` (データ取得スクリプト)
あらゆる型に対応できるように、データ取得ロジックを強化しました。
具体的には、以下のようなヘルパー関数を導入し、どの型で設定されていてもテキストとして取得できるようにしました。

```javascript
// どのような型でもテキストとして安全に取り出す関数
const getText = (prop) => {
    if (!prop) return "";
    if (prop.type === 'title') return prop.title?.[0]?.plain_text || "";
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || "";
    if (prop.type === 'select') return prop.select?.name || "";
    if (prop.type === 'number') return String(prop.number || "");
    // ...その他 phone_number, email, url などにも対応
    return "";
};
```

これにより、以下のカラム名（日本語）に対応しました：
*   **名前**
*   **テーブル番号**
*   **メッセージ**
*   **肩書き** (New)
*   **誕生月** (New)
*   **間柄** (New)
*   **イメージ** (画像ダウンロード処理も実装済み)

### `src/pages/GuestPage.tsx` (ゲスト詳細ページ)
取得した新しい項目を表示するようにデザインを調整しました。
*   名前の下に「肩書き」を表示
*   テーブル番号の横に「間柄」と「誕生月」のバッジを表示

## 3. 確認方法
デプロイ完了後、`/seating` ページからゲストを選択して詳細ページを確認してください。
画像や新しい項目が表示されていれば成功です。
もし画像が表示されない場合は、Notionの「イメージ」カラムに画像ファイルがアップロードされているか確認してください。
