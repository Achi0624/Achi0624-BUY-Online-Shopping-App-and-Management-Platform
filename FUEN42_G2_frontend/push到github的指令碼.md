# push到github的指令碼

完整的 Git 提交和推送到 `feature/李奕錡` 分支的步驟指南

## Step 1: 檢查當前狀態
```bash
git status
```
這會顯示哪些檔案已被修改、新增或刪除。

## Step 2: 將變更加入暫存區
```bash
# 加入所有變更
git add .

# 或者加入特定檔案
git add src/components/home/CategoryGrid.vue
git add src/views/ProductsView.vue
# ... 逐一加入其他檔案
```

## Step 3: 驗證暫存區內容
```bash
git status
```
應該會看到綠色的 "Changes to be committed" 訊息。

## Step 4: 建立提交
```bash
git commit -m "Your commit message here"
```

針對我們的變更，使用：
```bash
git commit -m "feat(ui): 完成商品頁面與首頁分類設計優化

- 將所有橙色主題色彩更新為淺草綠色系 (#7cb342)
- 優化 ProductsView 和 CategoryFilter 組件色彩一致性  
- 重新設計首頁分類圖示為現代化圓形設計
- 更新分類名稱和圖示：電子產品、母嬰用品、服飾鞋類等
- 實現大尺寸圖示溢出圓形邊界的視覺效果
- 統一使用淺灰色背景 (#f5f5f5) 提升視覺一致性"
```

## Step 5: 檢查分支和遠端設定
```bash
# 檢查當前分支
git branch

# 檢查遠端倉庫
git remote -v
```

## Step 6: 推送到 GitHub
```bash
git push origin feature/李奕錡
```

## Step 7: 驗證推送成功
```bash
git status
```
應該會顯示 "Your branch is up to date with 'origin/feature/李奕錡'"

---

## 如果遇到問題：

**驗證錯誤：**
```bash
# 檢查是否已登入 GitHub
gh auth status
# 或登入
gh auth login
```

**遠端分支不存在：**
```bash
git push -u origin feature/李奕錡
```

**推送被拒絕：**
```bash
# 先拉取最新變更
git pull origin feature/李奕錡
# 然後再推送
git push origin feature/李奕錡
```

**強制推送（謹慎使用）：**
```bash
git push --force-with-lease origin feature/李奕錡
```

---

## 常用指令速查

```bash
# 查看提交歷史
git log --oneline -5

# 查看檔案差異
git diff

# 查看暫存區差異
git diff --cached

# 取消暫存
git restore --staged <file>

# 撤銷最後一次提交（保留變更）
git reset --soft HEAD~1

# 查看分支
git branch -a
```

---

## 提交訊息規範

使用 Conventional Commits 格式：
- `feat:` 新功能
- `fix:` 修復錯誤
- `docs:` 文檔更新
- `style:` 代碼格式調整
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 其他雜項

範例：
```bash
git commit -m "feat(ui): 添加新的商品卡片組件"
git commit -m "fix(api): 修復商品搜索API錯誤"
git commit -m "style(css): 調整按鈕樣式"
```