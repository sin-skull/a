    // ========= カードデータ =========
    // rarity: 5〜1（★の数）
    // expiryDays: 賞味期限（日）
    // dp: DP効果値
    // bonus: 追加効果テキスト（なければ ""）

    const cards = [
      // ★5（7日）
      {
        id: "jiro",
        name: "二郎系豚骨醤油ラーメン（野菜マシマシ）",
        rarity: 5,
        expiryDays: 7,
        dp: 60,
        bonus: "昇格+10%",
        description: "濃厚スープと山盛り野菜が胃袋に直撃する、圧倒的ボリュームの一杯。"
      },
      {
        id: "harami",
        name: "厚切り牛ハラミ炭火焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 55,
        bonus: "昇格+8%",
        description: "炭火で香ばしく焼き上げた肉汁あふれる極上ハラミ。"
      },
      {
        id: "uni",
        name: "生うに（バフンウニ）",
        rarity: 5,
        expiryDays: 7,
        dp: 50,
        bonus: "排出率+10%",
        description: "濃厚でとろける甘みに満ちた贅沢な海の宝石。"
      },
      {
        id: "unaju",
        name: "特上うな重（国産うなぎ）",
        rarity: 5,
        expiryDays: 7,
        dp: 58,
        bonus: "ガチャ割引3%",
        description: "ふっくら香ばしい国産うなぎを贅沢に盛り込んだ逸品。"
      },
      {
        id: "ayu",
        name: "清流鮎の一本焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 48,
        bonus: "排出率+6%",
        description: "香り高く、川魚ならではのほろ苦さと旨味が広がる一本焼き。"
      },
      {
        id: "koshihikari",
        name: "魚沼産コシヒカリ 新米",
        rarity: 5,
        expiryDays: 7,
        dp: 52,
        bonus: "昇格+7%",
        description: "粒立ちが良く、噛むほどに甘みがあふれる最高峰の米。"
      },
      {
        id: "a5steak",
        name: "A5黒毛和牛ステーキ（岩塩添え）",
        rarity: 5,
        expiryDays: 7,
        dp: 65,
        bonus: "昇格+12%",
        description: "旨味の強い肉をシンプルに岩塩で味わう至高のステーキ。"
      },
      {
        id: "ootoro",
        name: "天然本マグロ大トロ握り",
        rarity: 5,
        expiryDays: 7,
        dp: 56,
        bonus: "排出率+9%",
        description: "とろける脂が口いっぱいに広がる贅沢なひと握り。"
      },
      {
        id: "nodoguro",
        name: "のどぐろ塩焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 50,
        bonus: "昇格+8%",
        description: "白身とは思えない脂の甘さを感じる“赤い宝石”の高級焼き魚。"
      },
      {
        id: "awabi",
        name: "あわびのバター焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 49,
        bonus: "排出率+7%",
        description: "コリコリとした食感にバターの香りが絡む贅沢な一皿。"
      },
      {
        id: "fugu",
        name: "ふぐ刺し（てっさ）",
        rarity: 5,
        expiryDays: 7,
        dp: 51,
        bonus: "排出率+8%",
        description: "淡泊ながら深い旨味を持つ、繊細な薄造りの高級料理。"
      },
      {
        id: "matsusaka",
        name: "松阪牛サーロインしゃぶしゃぶ",
        rarity: 5,
        expiryDays: 7,
        dp: 60,
        bonus: "昇格+11%",
        description: "とろける脂と上質な甘みが広がる極上しゃぶしゃぶ。"
      },
      {
        id: "kobe",
        name: "特選神戸牛すき焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 59,
        bonus: "昇格+10%",
        description: "濃厚な割下と上質な肉の甘みが一体となる至福の鍋。"
      },
      {
        id: "kinmedai",
        name: "金目鯛の煮付け（一本）",
        rarity: 5,
        expiryDays: 7,
        dp: 47,
        bonus: "排出率+6%",
        description: "甘辛いタレが染みたふっくら金目鯛の贅沢煮付け。"
      },
      {
        id: "iseebi",
        name: "伊勢海老の鬼殻焼き",
        rarity: 5,
        expiryDays: 7,
        dp: 62,
        bonus: "排出率+9%",
        description: "濃厚な旨味と香ばしさが楽しめる豪華な海老料理。"
      },
      {
        id: "zuwai",
        name: "本ズワイガニ姿盛り",
        rarity: 5,
        expiryDays: 7,
        dp: 57,
        bonus: "昇格+9%",
        description: "甘みの強い脚肉と旨味が詰まった蟹味噌を丸ごと味わえる。"
      },

      // ★4（4日）
      {
        id: "roastbeef",
        name: "黒毛和牛のローストビーフ",
        rarity: 4,
        expiryDays: 4,
        dp: 32,
        bonus: "昇格+6%",
        description: "しっとり柔らかく仕上げた上品なローストビーフ。"
      },
      {
        id: "foiegras",
        name: "フォアグラのソテー（バルサミコ仕立て）",
        rarity: 4,
        expiryDays: 4,
        dp: 30,
        bonus: "ガチャ割引2%",
        description: "濃厚なフォアグラに甘酸っぱいソースを合わせた高貴な味わい。"
      },
      {
        id: "truffle",
        name: "黒トリュフスライス",
        rarity: 4,
        expiryDays: 4,
        dp: 28,
        bonus: "昇格+7%",
        description: "強い香りが料理全体を引き立てる芳醇な高級食材。"
      },
      {
        id: "kanimiso",
        name: "濃厚かに味噌和え",
        rarity: 4,
        expiryDays: 4,
        dp: 26,
        bonus: "排出率+4%",
        description: "濃厚でコク深い蟹味噌を贅沢に味わう一品。"
      },
      {
        id: "fondue",
        name: "本格アルプス風チーズフォンデュ",
        rarity: 4,
        expiryDays: 4,
        dp: 25,
        bonus: "昇格+5%",
        description: "とろりとした濃厚チーズを絡めて楽しむ温かな料理。"
      },
      {
        id: "aburi_karubi",
        name: "炙りカルビ寿司",
        rarity: 4,
        expiryDays: 4,
        dp: 27,
        bonus: "排出率+4%",
        description: "香ばしい炙りカルビをのせた食べ応え抜群の寿司。"
      },
      {
        id: "kaisendon_tendon",
        name: "海老・穴子入り特上海鮮天丼",
        rarity: 4,
        expiryDays: 4,
        dp: 29,
        bonus: "昇格+4%",
        description: "海老と穴子が豪快にのった贅沢天丼。"
      },
      {
        id: "demi_pasta",
        name: "濃厚デミグラス・ビーフパスタ",
        rarity: 4,
        expiryDays: 4,
        dp: 26,
        bonus: "ガチャ割引1%",
        description: "深みのあるデミソースが麺に絡む満足度の高い一皿。"
      },
      {
        id: "mix_fry",
        name: "特製ミックスフライセット",
        rarity: 4,
        expiryDays: 4,
        dp: 25,
        bonus: "排出率+3%",
        description: "海老・白身魚・コロッケなどが楽しめるボリューム満点のセット。"
      },
      {
        id: "sapporo_shio",
        name: "札幌風・澄んだ塩ラーメン",
        rarity: 4,
        expiryDays: 4,
        dp: 22,
        bonus: "",
        description: "透き通ったスープに旨味が詰まったあっさり系ラーメン。"
      },
      {
        id: "gyutan",
        name: "牛タン炭火焼き（厚切り）",
        rarity: 4,
        expiryDays: 4,
        dp: 30,
        bonus: "昇格+5%",
        description: "厚切りなのに柔らかく、噛むほどに旨味が広がる名物料理。"
      },
      {
        id: "barachirashi",
        name: "海鮮バラちらし",
        rarity: 4,
        expiryDays: 4,
        dp: 26,
        bonus: "排出率+3%",
        description: "色とりどりの海の幸を盛り込んだ豪華なちらし寿司。"
      },
      {
        id: "yakitori",
        name: "焼き鳥盛り合わせ（特上）",
        rarity: 4,
        expiryDays: 4,
        dp: 24,
        bonus: "昇格+4%",
        description: "ジューシーな串を贅沢に味わえる上質な盛り合わせ。"
      },
      {
        id: "hamo_tempura",
        name: "ハモ天ぷら（梅塩）",
        rarity: 4,
        expiryDays: 4,
        dp: 24,
        bonus: "排出率+3%",
        description: "淡い旨味のハモをサクッと揚げた上品な天ぷら。"
      },
      {
        id: "namahamu_mozz",
        name: "生ハム＆モッツァレラ",
        rarity: 4,
        expiryDays: 4,
        dp: 23,
        bonus: "昇格+3%",
        description: "塩気とミルキーさが絶妙に合わさるシンプルな一皿。"
      },
      {
        id: "uni_cream_pasta",
        name: "濃厚ウニクリームパスタ",
        rarity: 4,
        expiryDays: 4,
        dp: 27,
        bonus: "昇格+4%",
        description: "ウニの濃厚な甘みが広がる贅沢クリームパスタ。"
      },
      {
        id: "omar_bisque",
        name: "オマール海老ビスク",
        rarity: 4,
        expiryDays: 4,
        dp: 29,
        bonus: "排出率+4%",
        description: "海老の旨味が凝縮した濃厚スープ。"
      },
      {
        id: "tomahawk",
        name: "トマホークステーキ（小）",
        rarity: 4,
        expiryDays: 4,
        dp: 28,
        bonus: "ガチャ割引2%",
        description: "骨付き肉の豪快な旨味が楽しめる人気ステーキ。"
      },
      {
        id: "ebi_gratin",
        name: "海老グラタン（特濃）",
        rarity: 4,
        expiryDays: 4,
        dp: 24,
        bonus: "昇格+3%",
        description: "濃厚クリームとプリプリ海老が絶妙に絡む熱々グラタン。"
      },
      {
        id: "lamb_chop",
        name: "ラムチョップ香草焼き",
        rarity: 4,
        expiryDays: 4,
        dp: 27,
        bonus: "昇格+4%",
        description: "香草とラム肉の風味が広がる大人向けの味わい。"
      },
      {
        id: "aburi_salmon_oyako",
        name: "炙りサーモン親子丼",
        rarity: 4,
        expiryDays: 4,
        dp: 26,
        bonus: "排出率+3%",
        description: "炙りの香りといくらの旨味が合わさる贅沢丼。"
      },
      {
        id: "kaki_fry",
        name: "カキフライ（広島産）",
        rarity: 4,
        expiryDays: 4,
        dp: 24,
        bonus: "昇格+3%",
        description: "サクサク衣の中にジューシーな牡蠣の旨味が詰まった一品。"
      },
      {
        id: "season_tempura",
        name: "季節野菜の天ぷら盛り",
        rarity: 4,
        expiryDays: 4,
        dp: 23,
        bonus: "",
        description: "旬の野菜をサクッと揚げた香ばしい天ぷら盛り。"
      },

      // ★3（3日） — 未実装分すべて追加
      {
        id: "katsudon",
        name: "ロースカツ丼（卵とじ）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "サクサク衣に甘めの出汁が染みた王道の丼もの。"
      },
      {
        id: "teriyaki_burger",
        name: "照り焼きチキンバーガー",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "甘辛ダレとジューシーなチキンが相性抜群のバーガー。"
      },
      {
        id: "yaki_curry",
        name: "スパイシー焼きカレー",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "香ばしく焼き上げたカレーにチーズがとろける一皿。"
      },
      {
        id: "miso_ramen",
        name: "濃厚味噌ラーメン（バター添え）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "コク深い味噌スープにバターが溶け込む濃厚ラーメン。"
      },
      {
        id: "oyakodon",
        name: "とろとろ親子丼",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "ふわとろ卵と鶏肉が織りなす優しい味わいの丼。"
      },
      {
        id: "margherita_s",
        name: "マルゲリータ（Sサイズ）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "シンプルな具材で焼き上げた定番ピザ。"
      },
      {
        id: "yakisoba",
        name: "屋台風ソース焼きそば",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "香ばしいソースが絡む屋台の味わい。"
      },
      {
        id: "cheese_dog",
        name: "伸びるモッツァレラスティック",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "びよーんと伸びるチーズが楽しい人気スナック。"
      },
      {
        id: "tacorice",
        name: "沖縄風タコライス",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "スパイス香るタコミートをご飯にのせた沖縄の定番。"
      },
      {
        id: "hamburg",
        name: "手ごねデミハンバーグ",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "肉汁たっぷりの手ごねハンバーグを濃厚デミで。"
      },
      {
        id: "tantan",
        name: "花椒香る本格担々麺",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "痺れる辛さとごまの濃厚スープがクセになる一杯。"
      },
      {
        id: "soboro",
        name: "三色そぼろ丼",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "鶏そぼろ・卵・野菜が彩りよくそろった丼。"
      },
      {
        id: "tonkotsu_extra",
        name: "豚骨ラーメン（替え玉付き）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "濃厚豚骨スープと替え玉でしっかり食べられる一杯。"
      },
      {
        id: "salmon_don",
        name: "サーモン丼（炙りあり）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "新鮮サーモンと炙りの香りが楽しめる贅沢な丼。"
      },
      {
        id: "curry_udon",
        name: "カレーうどん（濃厚出汁）",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "とろみのあるスープが麺に絡む濃厚カレーうどん。"
      },
      {
        id: "tonpei",
        name: "とん平焼き",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "豚肉と卵を香ばしく焼いた鉄板料理。"
      },
      {
        id: "kimchi_fried_rice",
        name: "キムチチャーハン",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "キムチの酸味と辛味が食欲をそそる炒飯。"
      },
      {
        id: "butakimu",
        name: "豚キムチ炒め",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "豚肉とキムチを強火で炒めたスタミナ満点の一品。"
      },
      {
        id: "chicken_nanban",
        name: "チキン南蛮（タルタル多め）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "甘酢ダレとタルタルが絶妙なボリューム系人気料理。"
      },
      {
        id: "yurinchi",
        name: "油淋鶏（ユーリンチー）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "カリカリ鶏肉に甘酸っぱいネギソースが絡む一品。"
      },
      {
        id: "motsuni",
        name: "もつ煮込み（味噌）",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "味噌の優しい味にホルモンの旨味が染みた一品。"
      },
      {
        id: "bifun",
        name: "焼きビーフン",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "あっさりとしながらも風味豊かな炒めビーフン。"
      },
      {
        id: "taiwan_mazesoba",
        name: "台湾まぜそば",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "ピリ辛の濃厚タレと具材が絡む人気まぜそば。"
      },
      {
        id: "mabo",
        name: "麻婆豆腐（四川風）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "山椒の痺れが効いた刺激的な麻婆豆腐。"
      },
      {
        id: "hiyashi_chuka",
        name: "冷やし中華",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "夏にぴったりの爽やかな酸味の定番麺料理。"
      },
      {
        id: "minestrone",
        name: "具沢山ミネストローネ",
        rarity: 3,
        expiryDays: 3,
        dp: 9,
        bonus: "",
        description: "野菜の旨味が溶け込んだ温かいスープ。"
      },
      {
        id: "teppan_napolitan",
        name: "鉄板焼きナポリタン（目玉焼き付き）",
        rarity: 3,
        expiryDays: 3,
        dp: 12,
        bonus: "",
        description: "鉄板の熱で香ばしく仕上がる懐かしの洋食ナポリタン。"
      },
      {
        id: "butakarubi",
        name: "甘辛ダレの豚カルビ焼き",
        rarity: 3,
        expiryDays: 3,
        dp: 13,
        bonus: "",
        description: "甘辛いタレが食欲を刺激する定番の肉料理。"
      },
      {
        id: "quattro",
        name: "クアトロフォルマッジ（四種チーズ）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "4種のチーズをたっぷり使った濃厚なピザ。"
      },
      {
        id: "gateau",
        name: "濃厚ガトーショコラ",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "しっとり濃厚で、口の中でゆっくりと溶けるスイーツ。"
      },
      {
        id: "mazesoba",
        name: "まぜそば（特製油ソース）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "麺に絡む濃厚な油ダレがクセになる一杯。"
      },
      {
        id: "raresteakdon",
        name: "レアステーキ丼（ガーリック醤油）",
        rarity: 3,
        expiryDays: 3,
        dp: 12,
        bonus: "",
        description: "レアに焼き上げた肉と香ばしい醤油が調和した贅沢丼。"
      },
      {
        id: "karaage",
        name: "若鶏のジューシー唐揚げ",
        rarity: 3,
        expiryDays: 3,
        dp: 13,
        bonus: "",
        description: "カリッと揚がった衣の中に肉汁がたっぷり詰まった唐揚げ。"
      },
      {
        id: "ebi_fry",
        name: "大海老フライ（自家製タルタル）",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "昇格+1%",
        description: "ぷりぷり海老と濃厚タルタルが相性抜群の王道フライ。"
      },
      {
        id: "crispy_pizza",
        name: "クリスピークラフトピザ",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "薄くパリッと焼き上げた香ばしいピザ。"
      },
      {
        id: "beefstew",
        name: "赤ワイン煮込みビーフシチュー",
        rarity: 3,
        expiryDays: 3,
        dp: 13,
        bonus: "",
        description: "じっくり煮込んだ肉と濃厚ソースが味わえる洋食の定番。"
      },
      {
        id: "calvi_kukpa",
        name: "韓国風カルビクッパ",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "旨辛スープとカルビの旨味が広がる刺激的な一杯。"
      },
      {
        id: "sushi_set",
        name: "寿司盛り合わせ（5貫）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "人気のネタを手軽に楽しめる小さな寿司セット。"
      },
      {
        id: "garlic_rice",
        name: "鉄板ガーリックライス",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "鉄板の香りとニンニクの風味が最高に食欲をそそる。"
      },
      {
        id: "gomoku_chuka",
        name: "五目中華丼",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "具だくさんで満足度の高いあんかけ中華丼。"
      },
      {
        id: "edo_tendon",
        name: "江戸前天丼（海老・野菜）",
        rarity: 3,
        expiryDays: 3,
        dp: 12,
        bonus: "",
        description: "甘辛ダレが染み込んだ天ぷらを豪快に盛り付けた天丼。"
      },
      {
        id: "cream_stew",
        name: "クリームシチュー（鶏肉入り）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "まろやかで優しい味わいの定番シチュー。"
      },
      {
        id: "fried_rice",
        name: "高火力パラパラ炒飯",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "高温で一気に炒めた香ばしいパラパラ炒飯。"
      },
      {
        id: "beef_curry",
        name: "ビーフカレー（中辛）",
        rarity: 3,
        expiryDays: 3,
        dp: 10,
        bonus: "",
        description: "深みのあるスパイスが香る定番カレー。"
      },
      {
        id: "ishiyaki_bibimbap",
        name: "石焼ビビンバ",
        rarity: 3,
        expiryDays: 3,
        dp: 11,
        bonus: "",
        description: "熱々の石鍋で香ばしく焼けたコチュジャンご飯。"
      },

      // ★2（2日）
      {
        id: "shiomusubi",
        name: "塩むすび（昆布・鮭）",
        rarity: 2,
        expiryDays: 2,
        dp: 7,
        bonus: "",
        description: "素材の味を活かしたシンプルで優しいおむすび。"
      },
      {
        id: "miso_soup",
        name: "わかめと豆腐の味噌汁",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "ほっと落ち着く家庭の味わい。"
      },
      {
        id: "kake_udon",
        name: "かけうどん",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "出汁の旨味をそのまま味わえるシンプルな一杯。"
      },
      {
        id: "cup_ramen",
        name: "醤油カップラーメン",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "手軽でどこか懐かしい醤油味の定番カップ麺。"
      },
      {
        id: "takoyaki",
        name: "関西風たこ焼き（ソース・マヨ）",
        rarity: 2,
        expiryDays: 2,
        dp: 6,
        bonus: "",
        description: "ふわとろ食感が魅力の屋台の味。"
      },
      {
        id: "custard_pudding",
        name: "昔ながらのカスタードプリン",
        rarity: 2,
        expiryDays: 2,
        dp: 6,
        bonus: "",
        description: "卵とミルクの優しい甘さが詰まった懐かしいプリン。"
      },
      {
        id: "caesar_salad",
        name: "シーザーサラダ（クルトン入り）",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "濃厚ドレッシングとクルトンの食感が特徴のサラダ。"
      },
      {
        id: "tamago_kake",
        name: "卵かけご飯（醤油付き）",
        rarity: 2,
        expiryDays: 2,
        dp: 6,
        bonus: "",
        description: "シンプルながら卵の旨味が引き立つ王道の一杯。"
      },
      {
        id: "kimchi_mori",
        name: "キムチ盛り",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "発酵の旨味がしっかり感じられるピリ辛キムチ。"
      },
      {
        id: "coleslaw",
        name: "コールスローサラダ",
        rarity: 2,
        expiryDays: 2,
        dp: 4,
        bonus: "",
        description: "シャキシャキ野菜をクリーミーに和えた定番サラダ。"
      },
      {
        id: "potato_salad",
        name: "ポテトサラダ",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "ほくほくじゃがいもが美味しい家庭の味。"
      },
      {
        id: "mini_omelet",
        name: "ミニオムレツ",
        rarity: 2,
        expiryDays: 2,
        dp: 4,
        bonus: "",
        description: "ふわふわで食べやすい朝食の定番。"
      },
      {
        id: "yakiimo",
        name: "焼き芋（ねっとり）",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "甘くてねっとりした食感が特徴のスイーツ系焼き芋。"
      },
      {
        id: "teriyaki_chicken",
        name: "照り焼きチキン",
        rarity: 2,
        expiryDays: 2,
        dp: 6,
        bonus: "",
        description: "甘辛いタレが絡んだジューシーなチキン。"
      },
      {
        id: "takikomi",
        name: "炊き込みご飯",
        rarity: 2,
        expiryDays: 2,
        dp: 7,
        bonus: "",
        description: "具材の旨味がご飯にしっかり染み込んだ人気料理。"
      },
      {
        id: "onion_soup",
        name: "オニオンスープ",
        rarity: 2,
        expiryDays: 2,
        dp: 4,
        bonus: "",
        description: "玉ねぎの甘さが溶け込んだほっとするスープ。"
      },
      {
        id: "clam_chowder",
        name: "クラムチャウダー",
        rarity: 2,
        expiryDays: 2,
        dp: 5,
        bonus: "",
        description: "貝の旨味とクリームのコクが広がる満足スープ。"
      },

      // ★1（1日）
      {
        id: "onion",
        name: "黄玉ねぎ",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "料理に欠かせない基本野菜。甘みと香りが魅力。"
      },
      {
        id: "negi",
        name: "小ねぎ（万能ねぎ）",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "薬味として幅広く使える香り高いネギ。"
      },
      {
        id: "potato",
        name: "北海道産じゃがいも",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "ホクホク食感が特徴の万能食材。"
      },
      {
        id: "carrot",
        name: "国産にんじん",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "甘みが強く料理全般に使える根菜。"
      },
      {
        id: "spring_cabbage",
        name: "春キャベツ",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "柔らかくて甘みのある旬のキャベツ。"
      },
      {
        id: "egg",
        name: "国産たまご",
        rarity: 1,
        expiryDays: 1,
        dp: 3,
        bonus: "",
        description: "どんな料理にも使える万能食材。"
      },
      {
        id: "pork_koma",
        name: "豚こま切れ肉",
        rarity: 1,
        expiryDays: 1,
        dp: 3,
        bonus: "",
        description: "手軽に使えて旨味のある定番肉。"
      },
      {
        id: "shiradashi",
        name: "本格白だし（昆布＋かつお）",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "出汁の旨味を手軽に加えられる万能調味料。"
      },
      {
        id: "bunashimeji",
        name: "ぶなしめじ",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "香りと歯ごたえが楽しめるキノコ。"
      },
      {
        id: "atsu_aburaage",
        name: "厚めの油あげ",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "ジューシーで煮物や味噌汁に最適。"
      },
      {
        id: "furukokumai",
        name: "古古古米（30年以上前の米）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "風味が抜けた古い米。食べられなくはない。"
      },
      {
        id: "cucumber",
        name: "生きゅうり",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "瑞々しくそのままでも食べられる定番野菜。"
      },
      {
        id: "momen_tofu",
        name: "木綿豆腐",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "しっかりした食感で煮込み料理向け。"
      },
      {
        id: "moyashi",
        name: "緑豆もやし",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "シャキシャキでどんな料理にも合う万能野菜。"
      },
      {
        id: "old_nori",
        name: "古海苔（風味落ち）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "湿気て香りが弱くなった海苔。"
      },
      {
        id: "cut_wakame",
        name: "カットわかめ（乾燥）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "水で戻すと便利に使える海藻。"
      },
      {
        id: "fukuma",
        name: "小麦ふすま",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "パンや健康食品に使われる繊維質。"
      },
      {
        id: "kirehashi_konnyaku",
        name: "切れ端こんにゃく",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "形は悪いが味しみが良いこんにゃく。"
      },
      {
        id: "wet_toast",
        name: "しなしなトースト",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "時間がたって水分を吸った元トースト。"
      },
      {
        id: "frozen_edamame",
        name: "冷凍枝豆（自然解凍）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "手軽につまめる簡易おつまみ。"
      },
      {
        id: "kizami_negi",
        name: "刻みネギ（大量）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "香り付けに便利な万能薬味。"
      },
      {
        id: "hourensou",
        name: "ほうれん草",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "栄養価が高く料理の彩りにも使える葉物。"
      },
      {
        id: "zucchini",
        name: "ズッキーニ",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "和洋中問わず使える万能野菜。"
      },
      {
        id: "piman",
        name: "ピーマン（3個）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "独特の苦味が料理にアクセントを加える。"
      },
      {
        id: "naganegi",
        name: "長ねぎ",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "香りと甘みが料理の深みを増す定番野菜。"
      },
      {
        id: "hakusai",
        name: "白菜1/4",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "鍋や炒め物に幅広く使える冬の定番。"
      },
      {
        id: "toumyou",
        name: "豆苗",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "シャキシャキで栄養価の高いスプラウト野菜。"
      },
      {
        id: "celery",
        name: "セロリ",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "独特の香りが特徴の洋食向け野菜。"
      },
      {
        id: "bacon_ends",
        name: "厚切りベーコン端材",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "不揃いだが旨味が強いベーコン。"
      },
      {
        id: "kalbi_ends",
        name: "カルビの切れ端",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "形は悪いが脂の旨味は本物。"
      },
      {
        id: "old_bread",
        name: "古い食パン（みみ）",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "乾燥して固くなったパンの耳。"
      },
      {
        id: "dried_shiitake",
        name: "乾燥しいたけ",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "戻すと旨味が強くなる保存食材。"
      },
      {
        id: "old_yogurt",
        name: "古いヨーグルト",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "やや酸味が強くなった賞味期限直前品。"
      },
      {
        id: "bad_tomato",
        name: "やや痛んだトマト",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "熟れすぎて柔らかくなったトマト。"
      },
      {
        id: "halfprice_sashimi",
        name: "半額刺身の残り",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "鮮度は落ちるが味はまだ保たれている。"
      },
      {
        id: "halfprice_fry",
        name: "半額惣菜フライ",
        rarity: 1,
        expiryDays: 1,
        dp: 2,
        bonus: "",
        description: "衣がしんなりした値引きフライ。"
      },
      {
        id: "expiring_milk",
        name: "賞味期限ギリギリ牛乳",
        rarity: 1,
        expiryDays: 1,
        dp: 1,
        bonus: "",
        description: "早く使い切りたい牛乳。"
      }
      // TODO: 他の★3料理も必要ならここに同じ形式で追加
    ];