BEGIN;

-- 出版社（UUIDはDBが自動採番）
INSERT INTO publishers (name) VALUES
  ('技術論評者'),
  ('オライリー・ニッポン'),
  ('MPクリエイティブ'),
  ('IBプレス'),
  ('照葉者')
ON CONFLICT (name) DO NOTHING;

-- ジャンル
INSERT INTO genres (name) VALUES
  ('プログラミング'),
  ('デザイン'),
  ('ビジネス'),
  ('ソフトウェア'),
  ('クラウドコンピューティング'),
  ('オペレーティングシステム'),
  ('自己啓発')
ON CONFLICT (name) DO NOTHING;

-- 著者
INSERT INTO authors (name, name_transcription) VALUES
  ('伊藤 健一', 'イトウ ケンイチ'),
  ('桜井 玲奈', 'サクライ レナ'),
  ('佐藤 可奈子', 'サトウ カナコ'),
  ('佐藤 大輔', 'サトウ ダイスケ'),
  ('鈴木 裕介', 'スズキ ユウスケ'),
  ('鈴木 悠真', 'スズキ ユウマ'),
  ('高橋 美咲', 'タカハシ ミサキ'),
  ('中村 拓也', 'ナカムラ タクヤ'),
  ('中村 由紀', 'ナカムラ ユキ'),
  ('山本 健一', 'ヤマモト ケンイチ'),
  ('山本 健太', 'ヤマモト ケンタ'),
  ('山本 拓也', 'ヤマモト タクヤ')
ON CONFLICT (name, name_transcription) DO NOTHING;

-- =========================================================
-- books
-- =========================================================
--  1: 2c3a8c7a-3f3f-4c4b-8c5b-0a2b2d6b6c01
--  2: 7b0d9f2e-8c9a-4e8b-9e2d-1c5e0b3a4d02
--  3: 1f2e3d4c-5b6a-4c7d-8e9f-0a1b2c3d4e03
--  4: 9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c04
--  5: 3d2c1b0a-9f8e-4d7c-8b6a-5e4f3d2c1b05
--  6: 4e5f6a7b-8c9d-4e0f-9a1b-2c3d4e5f6a06
--  7: 0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c07
--  8: 6a5f4e3d-2c1b-4a0f-8e9d-7c6b5a4f3e08
--  9: 8f7e6d5c-4b3a-4c2d-9e1f-0a9b8c7d6e09
-- 10: 5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e10
-- 11: 0f1e2d3c-4b5a-4c6d-8e7f-9a0b1c2d3e11
-- 12: 2d3c4b5a-6d7e-4f8a-9b0c-1d2e3f4a5b12
-- 13: 7e6d5c4b-3a2d-4c1f-8e9a-0b1c2d3e4f13
-- 14: 1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c14
-- 15: 9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b15
-- 16: 3b4c5d6e-7f8a-4b9c-8d0e-1f2a3b4c5d16
-- 17: 6c5b4a39-2817-4f6e-9d8c-7b6a5f4e3d17
-- 18: a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c18
-- 19: b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d19
-- 20: c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e20
-- 21: d4e5f6a1-b2c3-4d4e-8f5a-6b7c8d9e0f21
-- 22: e5f6a1b2-c3d4-4e5f-9a6b-7c8d9e0f1a22
-- 23: f6a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b23
-- 24: 0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d24
-- 25: 1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e25
-- 26: 2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a26
-- 27: 3f4a5b6c-7d8e-4f9a-8b0c-1d2e3f4a5b27
-- 28: 4a5b6c7d-8e9f-4a0b-8c1d-2e3f4a5b6c28
-- 29: 5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d29
-- 30: 6c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e30

INSERT INTO books (
  id, title, title_transcription, edition,
  publisher_id, publish_date, pages, genre_id,
  isbn, stock_count, cover_name
)
VALUES
  ('2c3a8c7a-3f3f-4c4b-8c5b-0a2b2d6b6c01','ゼロから始めて、しっかり身につく プログラミングの教科書','ゼロカラハジメテ、シッカリミニツク プログラミングノキョウカショ','第5版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2021-06-01',525,(SELECT id FROM genres WHERE name='プログラミング'),'9781925047234',2,'2c3a8c7a-3f3f-4c4b-8c5b-0a2b2d6b6c01.png'),
  ('7b0d9f2e-8c9a-4e8b-9e2d-1c5e0b3a4d02','リーダシップの教科書 信頼されるリーダになるための原理原則と実践法','リーダシップノキョウカショ シンライサレルリーダニナルタメノゲンリゲンソクトジッセンホウ','第3版',(SELECT id FROM publishers WHERE name='IBプレス'),'2023-11-01',416,(SELECT id FROM genres WHERE name='ビジネス'),'9781925047235',9,'7b0d9f2e-8c9a-4e8b-9e2d-1c5e0b3a4d02.png'),
  ('1f2e3d4c-5b6a-4c7d-8e9f-0a1b2c3d4e03','Next.jsの教科書 App Router・SSR・SSG・ISRを実践で理解する','Next.jsノキョウカショ App Router・SSR・SSG・ISRヲジッセンデリカイスル','第1版',(SELECT id FROM publishers WHERE name='技術論評者'),'2017-12-01',173,(SELECT id FROM genres WHERE name='プログラミング'),'9789583357977',10,'1f2e3d4c-5b6a-4c7d-8e9f-0a1b2c3d4e03.png'),
  ('9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c04','習慣の教科書 小さな習慣が、理想の自分をつくる','シュウカンノキョウカショ チイサナシュウカンガ、リソウノジブンヲツクル','第1版',(SELECT id FROM publishers WHERE name='照葉者'),'2024-07-01',153,(SELECT id FROM genres WHERE name='自己啓発'),'9781925047231',8,'9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c04.png'),
  ('3d2c1b0a-9f8e-4d7c-8b6a-5e4f3d2c1b05','大規模アプリ開発のための Reactの状態管理とTypeScriptの教科書','ダイキボアプリカイハツノタメノ ReactノジョウタイカンリトTypeScriptノキョウカショ','第1版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2016-10-01',515,(SELECT id FROM genres WHERE name='プログラミング'),'9787091017819',4,'3d2c1b0a-9f8e-4d7c-8b6a-5e4f3d2c1b05.png'),
  ('4e5f6a7b-8c9d-4e0f-9a1b-2c3d4e5f6a06','習慣が10割 結果を出す人が毎日やっていること','シュウカンが10ワリ ケッカヲダスヒトガマイニチヤッテイルコト','第3版',(SELECT id FROM publishers WHERE name='照葉者'),'2022-07-01',291,(SELECT id FROM genres WHERE name='自己啓発'),'9784078354614',3,'4e5f6a7b-8c9d-4e0f-9a1b-2c3d4e5f6a06.png'),
  ('0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c07','現場で使えるスキルが身につく React実践開発ガイド','ゲンバデツカエルスキルガミニツク Reactジッセンカイハツガイド','第1版',(SELECT id FROM publishers WHERE name='技術論評者'),'2024-03-01',146,(SELECT id FROM genres WHERE name='プログラミング'),'9787327991511',8,'0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c07.png'),
  ('6a5f4e3d-2c1b-4a0f-8e9d-7c6b5a4f3e08','Dockerの教科書 コンテナ技術の基本から実践的な活用方法まで','Dockerノキョウカショ コンテナギジュツノキホンカラジッセンテキナカツヨウホウホウマデ','第1版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2015-08-01',373,(SELECT id FROM genres WHERE name='ソフトウェア'),'9785716910174',7,'6a5f4e3d-2c1b-4a0f-8e9d-7c6b5a4f3e08.png'),
  ('8f7e6d5c-4b3a-4c2d-9e1f-0a9b8c7d6e09','続ける人の習慣術 「やる気」より「仕組み」で行動が自動化する方法','ツヅケルヒトノシュウカンジュツ 「ヤルキ」ヨリ「シクミ」デコウドウガジドウカスルホウホウ','第3版',(SELECT id FROM publishers WHERE name='IBプレス'),'2018-01-01',313,(SELECT id FROM genres WHERE name='自己啓発'),'9781925047230',7,'8f7e6d5c-4b3a-4c2d-9e1f-0a9b8c7d6e09.png'),
  ('5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e10','Azureの教科書 マイクロソフトクラウドコンピューティングの基礎から実践・運用まで','Azureノキョウカショ マイクロソフトクラウドコンピューティングノキソカラジッセン・ウンヨウマデ','第1版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2021-01-01',429,(SELECT id FROM genres WHERE name='クラウドコンピューティング'),'9789571349654',9,'5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e10.png'),
  ('0f1e2d3c-4b5a-4c6d-8e7f-9a0b1c2d3e11','レイアウトデザインの教科書 情報が伝わる、心が動くレイアウトのメソッド','レイアウトデザインノキョウカショ ジョウホウガツタワル、ココロガウゴクレイアウトノメソッド','第4版',(SELECT id FROM publishers WHERE name='照葉者'),'2025-11-01',600,(SELECT id FROM genres WHERE name='デザイン'),'9787958982403',10,'0f1e2d3c-4b5a-4c6d-8e7f-9a0b1c2d3e11.png'),
  ('2d3c4b5a-6d7e-4f8a-9b0c-1d2e3f4a5b12','はじめてでも、しっかりわかる Reactの教科書','ハジメテデモ、シッカリワカル Reactノキョウカショ','第2版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2016-04-01',370,(SELECT id FROM genres WHERE name='プログラミング'),'9787231245769',1,'2d3c4b5a-6d7e-4f8a-9b0c-1d2e3f4a5b12.png'),
  ('7e6d5c4b-3a2d-4c1f-8e9a-0b1c2d3e4f13','配色デザインの教科書 心地よく、印象に残る色の組み合わせとその考え方','ハイショクデザインノキョウカショ ココチヨク、インショウニノコルイロノクミアワセトソノカンガエカタ','第1版',(SELECT id FROM publishers WHERE name='照葉者'),'2015-08-01',550,(SELECT id FROM genres WHERE name='デザイン'),'9786336927282',7,'7e6d5c4b-3a2d-4c1f-8e9a-0b1c2d3e4f13.png'),
  ('1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c14','マルチクラウドコンピューティング設計の教科書 AWS・Azuru・GCPを使いこなすクラウドコンピューティングアーキテクチャの実践','マルチクラウドコンピューティングセッケイノキョウカショ AWS・Azuru・GCPヲツカイコナスクラウドコンピューティングアーキテクチャノジッセン','第1版',(SELECT id FROM publishers WHERE name='技術論評者'),'2018-05-01',512,(SELECT id FROM genres WHERE name='クラウドコンピューティング'),'9784860744375',6,'1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c14.png'),
  ('9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b15','コマンドを極めて、作業を効率化する Linuxコマンドリファレンス','コマンドヲキワメテ、サギョウヲコウリツカスル Linuxコマンドリファレンス','第2版',(SELECT id FROM publishers WHERE name='オライリー・ニッポン'),'2025-06-01',489,(SELECT id FROM genres WHERE name='プログラミング'),'9783898275378',10,'9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b15.png'),
  ('3b4c5d6e-7f8a-4b9c-8d0e-1f2a3b4c5d16','整える習慣 ムリなく続けられるシンプルな習慣の作り方','トトノエルシュウカン ムリナクツヅケラレルシンプルナシュウカンノツクリカタ','第1版',(SELECT id FROM publishers WHERE name='IBプレス'),'2024-01-01',512,(SELECT id FROM genres WHERE name='自己啓発'),'9781478246546',5,'3b4c5d6e-7f8a-4b9c-8d0e-1f2a3b4c5d16.png'),
  ('6c5b4a39-2817-4f6e-9d8c-7b6a5f4e3d17','デザインの基本と考え方 なぜ美しいデザインが人の心を動かすのか','デザインノキホントカンガエカタ ナゼウツクシイデザインガヒトノココロヲウゴカスノカ カンガエカタ・テジュン・ケンショウマデ、セッケイノスベテガワカル','第3版',(SELECT id FROM publishers WHERE name='照葉者'),'2023-02-01',439,(SELECT id FROM genres WHERE name='デザイン'),'9787231245761',10,'6c5b4a39-2817-4f6e-9d8c-7b6a5f4e3d17.png'),
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c18','魅せるビジュアルのつくり方 写真・色・レイアウトで世界観をデザインする','ミセルビジュアルノツクリカタ シャシン・イロ・レイアウトデセカイカンヲデザインスル','第3版',(SELECT id FROM publishers WHERE name='照葉者'),'2016-07-01',131,(SELECT id FROM genres WHERE name='デザイン'),'9787231245760',2,'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c18.png'),
  ('b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d19','Kubernetesの教科書 コンテナオーケストレーションの基礎から実践まで','Kubernetesノキョウカショ コンテナオーケストレーションノキソカラジッセンマデ','第3版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2020-02-01',408,(SELECT id FROM genres WHERE name='ソフトウェア'),'9786717888267',3,'b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d19.png'),
  ('c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e20','プロを目指す人のためのクリーンコードの書き方','プロヲメザスヒトノタメノクリーンコードノカキカタ','第8版',(SELECT id FROM publishers WHERE name='オライリー・ニッポン'),'2015-12-01',390,(SELECT id FROM genres WHERE name='プログラミング'),'9782598090067',9,'c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e20.png'),
  ('d4e5f6a1-b2c3-4d4e-8f5a-6b7c8d9e0f21','実務で役立つスキルが身につくLinux実践ガイド','ジツムデヤクダツスキルガミニツクLinuxジッセンガイド','第3版',(SELECT id FROM publishers WHERE name='技術論評者'),'2018-08-01',413,(SELECT id FROM genres WHERE name='プログラミング'),'9789371869248',1,'d4e5f6a1-b2c3-4d4e-8f5a-6b7c8d9e0f21.png'),
  ('e5f6a1b2-c3d4-4e5f-9a6b-7c8d9e0f1a22','Linuxの教科書 コマンドラインから学ぶサーバ構築と運用の基礎','Linuxノキョウカショ コマンドラインカラマナブサーバコウチクトウンヨウノキソ','第2版',(SELECT id FROM publishers WHERE name='技術論評者'),'2017-06-01',454,(SELECT id FROM genres WHERE name='オペレーティングシステム'),'9783852118234',2,'e5f6a1b2-c3d4-4e5f-9a6b-7c8d9e0f1a22.png'),
  ('f6a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b23','本気で学ぶ人のためのアルゴリズムとデータ構造','ホンキデマナブヒトノタメノアルゴリズムトデータコウゾウ','第7版',(SELECT id FROM publishers WHERE name='オライリー・ニッポン'),'2022-11-01',269,(SELECT id FROM genres WHERE name='プログラミング'),'9784399241333',4,'f6a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b23.png'),
  ('0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d24','戦略思考の教科書 変化の時代を生き抜くための戦略の立て方と実践','センリャクシコウノキョウカショ ヘンカノジダイヲイキヌクタメノセンリャクノタテカタトジッセン','第3版',(SELECT id FROM publishers WHERE name='照葉者'),'2023-07-01',243,(SELECT id FROM genres WHERE name='ビジネス'),'9782374002175',2,'0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d24.png'),
  ('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e25','はじめてでも、しっかり身につく AWSの教科書','ハジメテデモ、シッカリミニツク AWSの教科書','第3版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2025-01-01',112,(SELECT id FROM genres WHERE name='クラウドコンピューティング'),'9785463840681',6,'1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e25.png'),
  ('2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a26','成果が出る人の時間の使い方 ムダをなくし、やりたいことに集中する時間術のすべて','セイカガデルヒトノジカンノツカイカタ ムダヲナクシ、ヤリタイコトニシュウチュウスルジカンジュツノスベテ','第1版',(SELECT id FROM publishers WHERE name='IBプレス'),'2018-04-01',272,(SELECT id FROM genres WHERE name='自己啓発'),'9789667598721',8,'2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a26.png'),
  ('3f4a5b6c-7d8e-4f9a-8b0c-1d2e3f4a5b27','Google Cloudの教科書 オペレーティングシステムからデータ分析・AIまでGCPのすべてをこの1冊で','Google Cloudノキョウカショ オペレーティングシステムカラデータブンセキ・AIマデGCPノスベテヲコノ1サツデ','第3版',(SELECT id FROM publishers WHERE name='MPクリエイティブ'),'2019-04-01',395,(SELECT id FROM genres WHERE name='クラウドコンピューティング'),'9789717013562',3,'3f4a5b6c-7d8e-4f9a-8b0c-1d2e3f4a5b27.png'),
  ('4a5b6c7d-8e9f-4a0b-8c1d-2e3f4a5b6c28','仕事で成果を出す人の思考と習慣 結果を出し続ける人が大切にしていること','シゴトデセイカヲダスヒトノシコウトシュウカン ケッカヲダシツヅケルヒトガタイセツニシテイルコト','第3版',(SELECT id FROM publishers WHERE name='照葉者'),'2024-12-01',417,(SELECT id FROM genres WHERE name='ビジネス'),'9789517578945',3,'4a5b6c7d-8e9f-4a0b-8c1d-2e3f4a5b6c28.png'),
  ('5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d29','Linuxシステムの仕組み カーネル・プロセス・メモリの動作原理をやさしく解説','Linuxシステムノシクミ カーネル・プロセス・メモリノドウサゲンリヲヤサシクカイセツ','第2版',(SELECT id FROM publishers WHERE name='技術論評者'),'2015-02-01',469,(SELECT id FROM genres WHERE name='オペレーティングシステム'),'9782289744899',5,'5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d29.png'),
  ('6c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e30','基礎からしっかり学べる Linuxの教科書','キソカラシッカリマナベル Linuxノキョウカショ','第2版',(SELECT id FROM publishers WHERE name='IBプレス'),'2023-02-01',164,(SELECT id FROM genres WHERE name='クラウドコンピューティング'),'9786339238076',2,'6c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e30.png')
ON CONFLICT (isbn) DO NOTHING;

-- =========================================================
-- book_authors
-- =========================================================
INSERT INTO book_authors (book_id, author_id)
VALUES
  ('2c3a8c7a-3f3f-4c4b-8c5b-0a2b2d6b6c01',(SELECT id FROM authors WHERE name='中村 拓也')),
  ('7b0d9f2e-8c9a-4e8b-9e2d-1c5e0b3a4d02',(SELECT id FROM authors WHERE name='山本 健太')),
  ('1f2e3d4c-5b6a-4c7d-8e9f-0a1b2c3d4e03',(SELECT id FROM authors WHERE name='中村 拓也')),
  ('9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c04',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('3d2c1b0a-9f8e-4d7c-8b6a-5e4f3d2c1b05',(SELECT id FROM authors WHERE name='鈴木 悠真')),
  ('4e5f6a7b-8c9d-4e0f-9a1b-2c3d4e5f6a06',(SELECT id FROM authors WHERE name='山本 健一')),
  ('0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c07',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('6a5f4e3d-2c1b-4a0f-8e9d-7c6b5a4f3e08',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('8f7e6d5c-4b3a-4c2d-9e1f-0a9b8c7d6e09',(SELECT id FROM authors WHERE name='中村 拓也')),
  ('5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e10',(SELECT id FROM authors WHERE name='中村 拓也')),
  ('0f1e2d3c-4b5a-4c6d-8e7f-9a0b1c2d3e11',(SELECT id FROM authors WHERE name='中村 由紀')),
  ('2d3c4b5a-6d7e-4f8a-9b0c-1d2e3f4a5b12',(SELECT id FROM authors WHERE name='山本 健太')),
  ('7e6d5c4b-3a2d-4c1f-8e9a-0b1c2d3e4f13',(SELECT id FROM authors WHERE name='桜井 玲奈')),
  ('1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c14',(SELECT id FROM authors WHERE name='鈴木 悠真')),
  ('9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b15',(SELECT id FROM authors WHERE name='山本 健太')),
  ('3b4c5d6e-7f8a-4b9c-8d0e-1f2a3b4c5d16',(SELECT id FROM authors WHERE name='鈴木 悠真')),
  ('6c5b4a39-2817-4f6e-9d8c-7b6a5f4e3d17',(SELECT id FROM authors WHERE name='佐藤 可奈子')),
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c18',(SELECT id FROM authors WHERE name='高橋 美咲')),
  ('b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d19',(SELECT id FROM authors WHERE name='鈴木 裕介')),
  ('c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e20',(SELECT id FROM authors WHERE name='鈴木 悠真')),
  ('d4e5f6a1-b2c3-4d4e-8f5a-6b7c8d9e0f21',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('e5f6a1b2-c3d4-4e5f-9a6b-7c8d9e0f1a22',(SELECT id FROM authors WHERE name='中村 拓也')),
  ('f6a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b23',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d24',(SELECT id FROM authors WHERE name='鈴木 悠真')),
  ('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e25',(SELECT id FROM authors WHERE name='山本 健太')),
  ('2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a26',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('3f4a5b6c-7d8e-4f9a-8b0c-1d2e3f4a5b27',(SELECT id FROM authors WHERE name='佐藤 大輔')),
  ('4a5b6c7d-8e9f-4a0b-8c1d-2e3f4a5b6c28',(SELECT id FROM authors WHERE name='山本 拓也')),
  ('5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d29',(SELECT id FROM authors WHERE name='伊藤 健一')),
  ('6c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e30',(SELECT id FROM authors WHERE name='中村 拓也'))
ON CONFLICT DO NOTHING;

COMMIT;
