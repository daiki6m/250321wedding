# Notion連携セットアップガイド

本番環境でNotionのデータを表示するための設定手順です。

## 1. Notionインテグレーションの作成 (APIキーの取得)
1. [Notion My Integrations](https://www.notion.so/my-integrations) にアクセスします。
2. 「新しいインテグレーション」をクリックします。
3. 以下の情報を入力します：
   - **名前**: Wedding Website (など、わかりやすい名前)
   - **関連ワークスペース**: 使用するワークスペースを選択
   - **種類**: 内部インテグレーション
4. 「保存」をクリックします。
5. 表示された **「内部インテグレーションシークレット」** (APIキー) をコピーして控えておきます。
   - 例: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 2. Notionデータベースの準備
1. Notionで新しいページを作成し、「データベース（フルページ）」を作成します。
2. 以下のプロパティ（列）を設定します（名前は正確に合わせてください）：
   - **Name** (タイトル): ゲストの名前 (例: 山田 太郎 様)
   - **Table** (テキスト): テーブル番号/記号 (例: A)
   - **Message** (テキスト): ゲストへのメッセージ
3. データベースのURLを確認し、**「データベースID」** を取得します。
   - URL形式: `https://www.notion.so/myworkspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - `myworkspace/` の後ろから `?` の前までの32桁の文字列がIDです。

## 3. インテグレーションをデータベースに接続
1. 作成したデータベースの右上にある「...」メニューをクリックします。
2. 「接続先」 (Connect to) をクリックします。
3. 手順1で作成したインテグレーション名（例: Wedding Website）を検索して選択します。
4. 「確認」をクリックして接続します。

## 4. GitHub Secretsの設定
1. GitHubリポジトリのページを開きます。
2. **Settings** > **Secrets and variables** > **Actions** に移動します。
3. 「New repository secret」をクリックし、以下の2つを追加します：

| Name | Secret (値) |
| :--- | :--- |
| `NOTION_API_KEY` | 手順1でコピーしたシークレット (`secret_...`) |
| `NOTION_DATABASE_ID` | 手順2で取得したデータベースID |

## 5. デプロイの確認
設定が完了したら、GitHub Actionsが自動的に再実行されるわけではありません。
何か小さな変更（例: READMEの更新など）をプッシュするか、Actionsタブから手動でワークフローを実行して、デプロイが成功するか確認してください。
成功すれば、Notionに入力したデータがサイト（`/seating` や `/guest`）に反映されます。
