# Life 上线与使用
## 1. 把 Life 提交到 Lab
压缩包含 Life/、.github/workflows/life-guide.yml 和对现有 Lab 首页的增量补丁 Life-Lab.patch。推荐用 GitHub Desktop 克隆 jearns/Lab，打开该仓库的终端，在 main 拉取最新提交。把补丁放到仓库外，从仓库目录执行（路径可替换）：
```sh
git apply --check ../Life-Lab.patch
git apply ../Life-Lab.patch
git add Life .github/workflows/life-guide.yml index.html
git commit -m "Add Life personal and family planner"
git push origin main
```
补丁已经包含全部文件，只需应用一次。若首页有新改动导致检查失败，也可仅复制包内的 Life 和 .github/workflows/life-guide.yml，在 Lab 首页自行添加链接 ./Life/，再提交。保留根 CNAME 中的 lab.iinnkk.me。
## 2. 建立单独的域名入口
1. 在 Cloudflare 控制台打开 Workers & Pages，选择 Create application，再进入 Pages → Connect to Git，连接 GitHub。只授权 jearns/Lab 即可。
2. 选择 Lab。项目名可填 iinnkk-life（若占用则换一个），生产分支 main，框架 None，根目录留空（仓库根），构建命令留空，输出目录 Life。保存并部署。
3. 打开控制台给出的实际 pages.dev 地址，确认标题为「Life · 生活手记」，打开指南并翻一页。
4. 进入该 Pages 项目的 Custom domains → Set up a custom domain，填写 life.iinnkk.me。先在项目里添加这个名字，再配置 DNS。
5. 打开 iinnkk.me 当前 DNS 服务商的解析控制台。新增一条 CNAME，主机记录 life，目标为第 3 步的实际主机名（形如 iinnkk-life.pages.dev，不含 https:// 和斜线），TTL 自动。若域名托管在同一 Cloudflare 账户，按向导确认自动创建即可。若 life 已有记录，核对用途后再修改该条。根域和 lab 的记录保持原值。
6. 等 Custom domains 显示 Active，访问 https://life.iinnkk.me，完成自测、打卡，刷新后确认保留。用手机浏览器的「添加到主屏幕」打开。不同域名、浏览器和设备各有独立档案，建议正式使用前选定入口。
7. 到 GitHub 的 Actions → Sync Life guide 手动运行一次，确认绿色成功。它每天北京时间 04:17 排队检查作者仓库，检测到变更才提交，时间可能延迟。确认工作流对仓库有 contents: write 权限；组织策略与分支保护需允许自动提交。Cloudflare Pages Git 集成负责接收更新后的部署；若未触发，请在 Pages 的 Deployments 手动重试部署并核对发布的提交。
官方资料：[Pages Git 部署](https://developers.cloudflare.com/pages/get-started/git-integration/) · [绑定自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)
## 3. 第一次使用
在「今日」完成三步自测。以 48 岁、退休生活、成长、每天三件为例，得到专注、步行和阅读三张卡。「家庭」可一键创建九人模板，包括本人、伴侣、两个孩子、双方父母、姐姐。模板只填关系，切换成员后各自设置年龄、目标和时段。称呼可在重新自测时修改。在家庭页可看到当天完成数。
「安排与提醒」可替换每张卡、调整时间或导出系统日历。导入 ICS 并允许日历通知后可在关闭网页时收到定时提醒。改动时间后请在日历里删除旧的重复事项再导入。页面通知仅对当前成员、网页可运行时生效。久坐使用自行启动的 45 分钟计时器。喝水可在安排里选「给自己倒杯水」。
「记录」里可分早餐、午餐、晚餐和加餐登记食物、份量；这里保存自述，不计算营养成分。步数可手填，或授权个人接入地址后，由能汇总健康数据的快捷指令传入当天累计值。用同一浏览器打开，重复导入同一累计值不会相加。目标由本人设置，达到后当天的步行卡自动完成。接入地址使用 URL 片段；步数和成员编号不随 HTTP 请求发送给网站。跨设备协作、手表后台直读、Android 或鸿蒙原生健康授权暂未提供。
「指南」收录 34 章正文条目，按屏分页，可以搜索标题、读原文、查看来源，或收进自己的阅读时段。每日匹配会考虑首要目标、生活阶段、年龄和指定主题。收进计划会替换当天最后一个时段及以后的同一时段。每日行动是 Life 的实践改编；读者评论为人工节选，附原讨论链接。同步工作流更新的是作者指南正文。
## 4. 作品来源
eternity4719《高性价比人生指南》，https://github.com/eternity4719/HowToLiveBetter 。正文采用 CC BY 4.0，https://creativecommons.org/licenses/by/4.0/ 。Life 重新排版正文、去除隐藏的标签注释，独立设计打卡提示；版本见 data/guide.json 中的 version 和 date。原文中的各地区制度及适用条件以作者所列来源为准。
