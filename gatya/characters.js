// ========= キャラデータ =========
// rarity: 5〜1（★の数）

const characters = [
  // ★5
  {
    id: "shokurai_jounokami",
    name: "喰雷 城ノ神",
    rarity: 5,
    food: "二郎系豚骨醤油ラーメン（野菜マシマシ）",
    effect: "デイリーポイント+250",
    personality: "豪快・頼れる兄貴分・気前がいい",
    description: "飢えを抱える者の前に現れ、雷の勢いで満腹へ導く飢雷の神。山盛りの旨さで人に力を与える。"
  },
  {
    id: "honoka_mikoto",
    name: "炎界 ほむら乃ミコト",
    rarity: 5,
    food: "厚切り牛ハラミ炭火焼き",
    effect: "昇格演出アップ+20%",
    personality: "寡黙・職人肌・冷静さの中に強い熱",
    description: "肉の声を聞くことができる炎界の神。完璧な火入れを操り、旨味の極致を生む。"
  },
  {
    id: "uni_mitama",
    name: "海宝 ウーニミタマ",
    rarity: 5,
    food: "生うに（バフンウニ）",
    effect: "排出率アップ+10%",
    personality: "静か・上品・やさしい",
    description: "海に宿る宝珠の加護を持つ神。潮の旨味を選ばれし者へ授ける。"
  },
  {
    id: "unagawa_tawara",
    name: "五重塔 ウナガワ タワラ",
    rarity: 5,
    food: "特上うな重（国産うなぎ）",
    effect: "ガチャ割引5%",
    personality: "豪胆・陽気・努力家を好む",
    description: "層が重なるほど強さを増す塔の神。積み重ねるもの全てが力となる。"
  },
  {
    id: "shizukawa_okina",
    name: "河神 シズカワノオキナ",
    rarity: 5,
    food: "清流鮎の一本焼き",
    effect: "DP+150／排出率+5%",
    personality: "落ち着き・慈愛・穏やか",
    description: "川の深い旨味を司る古き神。静かに沁みる味で疲れを癒す。"
  },
  {
    id: "koshihikari_kou",
    name: "米皇 コシヒカリ",
    rarity: 5,
    food: "魚沼産コシヒカリ 新米",
    effect: "DP+180／昇格+5%",
    personality: "清らか・気高い・穏やか",
    description: "日本随一の米の魂をまとう皇。ひと粒ひと粒が黄金の輝きを宿し、食を司る神々の中でも特別に尊ばれる存在。"
  },

  // ★4
  {
    id: "roastbeef_lord",
    name: "ローストビーフ城主",
    rarity: 4,
    food: "黒毛和牛のローストビーフ",
    effect: "DP+50",
    personality: "落ち着いた貴族気質・優雅",
    description: "低温の旨味を誇りとする紳士。しっとりした深みで城を守る。"
  },
  {
    id: "foiegras_count",
    name: "フォアグラ伯爵",
    rarity: 4,
    food: "フォアグラのソテー（バルサミコ仕立て）",
    effect: "ガチャ割引3%",
    personality: "高慢・気品・グルメ",
    description: "濃厚さを至高とする伯爵。脂の旨味を操る。"
  },
  {
    id: "truffle_princess",
    name: "トリュフ王女",
    rarity: 4,
    food: "黒トリュフスライス",
    effect: "昇格演出+10%",
    personality: "気品・謙虚・存在感",
    description: "芳醇な香りの加護を持つ王女。場を変える力を持つ。"
  },
  {
    id: "kanimiso_daimyo",
    name: "カニ味噌大名",
    rarity: 4,
    food: "濃厚かに味噌和え",
    effect: "排出率+4%",
    personality: "豪快・大雑把",
    description: "濃厚な旨味を粋として語る大名。旨い物の前では正直。"
  },
  {
    id: "cheese_fondue_princess",
    name: "チーズフォンデュ姫",
    rarity: 4,
    food: "本格アルプス風チーズフォンデュ",
    effect: "昇格演出+8%",
    personality: "明るい・甘え上手",
    description: "とろける力を操る姫。温かさで場を癒す。"
  },
  {
    id: "kalbi_sushi_general",
    name: "カルビ寿司将軍",
    rarity: 4,
    food: "炙りカルビ寿司",
    effect: "排出率+4%",
    personality: "厳格・礼儀正しい",
    description: "肉と酢飯の調和を極めた将軍。一口で士気を高める。"
  },
  {
    id: "seafood_tendon_marshal",
    name: "海鮮天丼元帥",
    rarity: 4,
    food: "海老・穴子入り特上海鮮天丼",
    effect: "DP+40",
    personality: "勇ましい・頼りがい",
    description: "海の幸を豪快に揚げる元帥。重みの旨さで味方を鼓舞。"
  },
  {
    id: "beef_pasta_lord",
    name: "濃厚ビーフパスタ卿",
    rarity: 4,
    food: "濃厚デミグラス・ビーフパスタ",
    effect: "ガチャ割引3%",
    personality: "知的・落ち着き",
    description: "濃厚ソースの深みを知り尽くす卿。旨味を語ると止まらない。"
  },
  {
    id: "fried_king",
    name: "豪快揚げ物キング",
    rarity: 4,
    food: "特製ミックスフライセット",
    effect: "DP+35",
    personality: "明るい・豪快",
    description: "サクサクの衣を誇る王。揚げる音で場を明るくする。"
  },
  {
    id: "ramen_samurai",
    name: "ラーメン侍",
    rarity: 4,
    food: "札幌風・澄んだ塩ラーメン",
    effect: "DP+15",
    personality: "真面目・ストイック",
    description: "麺の道を極める侍。湯気を剣気に変える。"
  },

  // ★3
  {
    id: "napolitan_demon",
    name: "鉄板ナポリタン魔人",
    rarity: 3,
    food: "鉄板焼きナポリタン（目玉焼き付き）",
    effect: "DP+30",
    personality: "熱血・元気",
    description: "鉄板の熱を力に変える魔人。焦げ目にこだわる。"
  },
  {
    id: "butakaru_bin",
    name: "豚カルビン",
    rarity: 3,
    food: "甘辛ダレの豚カルビ焼き",
    effect: "DP+25",
    personality: "熱血・短気",
    description: "豚カルビの擬人化。好物は豚汁。"
  },
  {
    id: "fourcheese_emperor",
    name: "四種チーズ皇帝",
    rarity: 3,
    food: "クアトロフォルマッジ（四種チーズ）",
    effect: "DP+20",
    personality: "高貴・どっしり",
    description: "四つの個性をまとめる皇帝。濃厚の支配者。"
  },
  {
    id: "lava_choco_maou",
    name: "溶岩チョコ魔王",
    rarity: 3,
    food: "濃厚ガトーショコラ",
    effect: "DP+22",
    personality: "ドS・甘くて黒い",
    description: "熱い甘味で人を翻弄する魔王。"
  },
  {
    id: "aburasoba_commander",
    name: "油そば司令官",
    rarity: 3,
    food: "まぜそば（特製油ソース）",
    effect: "DP+18",
    personality: "冷静・軍師",
    description: "まぜる戦術を得意とする司令官。"
  },
  {
    id: "steakdon_swordsman",
    name: "ステーキ丼剣士",
    rarity: 3,
    food: "レアステーキ丼（ガーリック醤油）",
    effect: "DP+20",
    personality: "正義感・熱心",
    description: "肉を刃のように操る若き剣士。"
  },
  {
    id: "karaage_road",
    name: "唐揚げロード",
    rarity: 3,
    food: "若鶏のジューシー唐揚げ",
    effect: "DP+25",
    personality: "元気・明るい",
    description: "ザクザクの勇気で突き進む旅人。"
  },
  {
    id: "ebi_fry_colonel",
    name: "海老フライ大佐",
    rarity: 3,
    food: "大海老フライ（自家製タルタル）",
    effect: "割引1%",
    personality: "紳士・几帳面",
    description: "真っ直ぐ立つ衣を誇る大佐。"
  },
  {
    id: "crispy_pizza_demon",
    name: "クリスピーピザ魔王",
    rarity: 3,
    food: "クリスピークラフトピザ",
    effect: "昇格+3%",
    personality: "気まぐれ・不敵",
    description: "カリッと焼き上げる魔力を持つ。"
  },
  {
    id: "beefstew_general",
    name: "ビーフシチュー将軍",
    rarity: 3,
    food: "赤ワイン煮込みビーフシチュー",
    effect: "DP+35",
    personality: "温厚・深み",
    description: "煮込まれた経験を持つ将軍。"
  },
  {
    id: "kalbi_kkuppa_queen",
    name: "カルビクッパ女王",
    rarity: 3,
    food: "韓国風カルビクッパ",
    effect: "DP+20",
    personality: "優しい・包容力",
    description: "辛味と旨味の調和を守る女王。"
  },
  {
    id: "kaiten_sushi_ninja",
    name: "回転寿司忍者",
    rarity: 3,
    food: "寿司盛り合わせ（5貫）",
    effect: "排出+1%",
    personality: "素早い・クール",
    description: "流れるような動きで敵を翻弄。"
  },
  {
    id: "garlicrice_ninja",
    name: "ガーリックライス忍",
    rarity: 3,
    food: "鉄板ガーリックライス",
    effect: "排出+1%",
    personality: "陽気・軽い",
    description: "香りで場を元気にする忍び。"
  },
  {
    id: "chukadon_princess",
    name: "中華丼皇女",
    rarity: 3,
    food: "五目中華丼",
    effect: "DP+20",
    personality: "元気・お転婆",
    description: "具材の豊かさが性格に出る皇女。"
  },
  {
    id: "tendon_master",
    name: "天丼の達人",
    rarity: 3,
    food: "江戸前天丼（海老・野菜）",
    effect: "昇格+3%",
    personality: "職人気質・寡黙",
    description: "黄金色の揚げを追求する達人。"
  },
  {
    id: "carbonara_sister",
    name: "カルボナーラ姉",
    rarity: 3,
    food: "濃厚カルボナーラ（生クリーム仕立て）",
    effect: "DP+5",
    personality: "優しい・包み込む",
    description: "クリームのように包み込む姉。"
  },
  {
    id: "katsudon_oyakata",
    name: "カツ丼親方",
    rarity: 3,
    food: "ロースカツ丼（卵とじ）",
    effect: "DP+10",
    personality: "豪快・職人",
    description: "揚げ物の音でテンションが上がる親方。"
  },
  {
    id: "teriyaki_burger_kun",
    name: "てりやきバーガーくん",
    rarity: 3,
    food: "照り焼きチキンバーガー",
    effect: "DP+6",
    personality: "明るい・甘い",
    description: "愛嬌たっぷりのバーガー少年。"
  },
  {
    id: "yaki_curry_magician",
    name: "焼きカレーの魔術師",
    rarity: 3,
    food: "スパシー焼きカレー",
    effect: "DP+8",
    personality: "スパイス好き・好奇心旺盛",
    description: "焦げ目にこだわる魔術師。"
  },
  {
    id: "miso_ramen_kun",
    name: "あったか味噌ラーメン君",
    rarity: 3,
    food: "濃厚味噌ラーメン（バター添え）",
    effect: "DP+5",
    personality: "癒し・温かい",
    description: "寒い日ほど強くなるラーメン少年。"
  },
  {
    id: "oyakodon_chan",
    name: "親子丼ちゃん",
    rarity: 3,
    food: "とろとろ親子丼",
    effect: "DP+7",
    personality: "優しい・穏やか",
    description: "とろっとした雰囲気の少女。"
  },
  {
    id: "pizza_junior",
    name: "ピザ職人ジュニア",
    rarity: 3,
    food: "マルゲリータ（Sサイズ）",
    effect: "DP+6",
    personality: "修行熱心・元気",
    description: "チーズの伸びにこだわる若手。"
  },
  {
    id: "yakisoba_king",
    name: "焼きそばキング",
    rarity: 3,
    food: "屋台風ソース焼きそば",
    effect: "DP+8",
    personality: "陽気・熱血",
    description: "鉄板を見ると魂が燃えるキング。"
  },
  {
    id: "cheese_dog_chan",
    name: "チーズドッグちゃん",
    rarity: 3,
    food: "伸びるモッツァレラスティック",
    effect: "排出+0.5%",
    personality: "甘えん坊・元気",
    description: "伸びるチーズで癒す少女。"
  },
  {
    id: "tacorice_kun",
    name: "タコライスくん",
    rarity: 3,
    food: "沖縄風タコライス",
    effect: "DP+7",
    personality: "開放的・陽気",
    description: "南国の風を運ぶ少年。"
  },
  {
    id: "hamburg_ani",
    name: "ハンバーグ兄",
    rarity: 3,
    food: "手ごねデミハンバーグ",
    effect: "DP+7",
    personality: "温厚・面倒見が良い",
    description: "肉汁のような温かさを持つ兄さん。"
  },
  {
    id: "tantanmen_ane",
    name: "担々麺姐さん",
    rarity: 3,
    food: "花椒香る本格担々麺",
    effect: "昇格+2%",
    personality: "辛口・姉御肌",
    description: "刺激が足りないと不機嫌になる。"
  },
  {
    id: "creamstew_sama",
    name: "クリームシチュー様",
    rarity: 3,
    food: "クリームシチュー（鶏肉入り）",
    effect: "DP+6",
    personality: "落ち着き・優雅",
    description: "とろみで全てを包む淑女。"
  },
  {
    id: "soboro_don_chan",
    name: "そぼろ丼ちゃん",
    rarity: 3,
    food: "三色そぼろ丼",
    effect: "DP+4",
    personality: "元気・素直",
    description: "三色のリズムを持つ少女。"
  },
  {
    id: "chaofan_laoshi",
    name: "炒飯老師",
    rarity: 3,
    food: "高火力パラパラ炒飯",
    effect: "割引0.5%",
    personality: "達人・熱心",
    description: "鍋さばきの達人。熱い教えが持ち味。"
  },
  {
    id: "onigiri_brothers",
    name: "おにぎり兄弟",
    rarity: 3,
    food: "塩むすび（昆布・鮭）",
    effect: "DP+3",
    personality: "仲良し・元気",
    description: "握りの強さで性格が変わる兄弟。"
  },
  {
    id: "misoshiru_san",
    name: "味噌汁さん",
    rarity: 3,
    food: "わかめと豆腐の味噌汁",
    effect: "DP+2",
    personality: "落ち着き・穏やか",
    description: "心を温める存在。"
  },
  {
    id: "udon_spirit",
    name: "うどんの精",
    rarity: 3,
    food: "かけうどん",
    effect: "DP+1",
    personality: "ふわっと優しい",
    description: "柔らかな精霊。"
  },
  {
    id: "mini_cupmen",
    name: "ミニカップ麺君",
    rarity: 3,
    food: "醤油カップラーメン",
    effect: "DP+2",
    personality: "小柄・頼れる",
    description: "忙しい人の味方。手軽さが武器。"
  },
  {
    id: "takoyaki_musume",
    name: "たこ焼き娘",
    rarity: 3,
    food: "関西風たこ焼き（ソース・マヨ）",
    effect: "DP+1",
    personality: "明るい・元気",
    description: "熱々でテンション高めの娘。"
  },
  {
    id: "pudding_boy",
    name: "プリンボーイ",
    rarity: 3,
    food: "昔ながらのカスタードプリン",
    effect: "DP+2",
    personality: "甘えん坊",
    description: "ぷるぷるで癒すのが得意。"
  },
  {
    id: "salad_kun",
    name: "サラダくん",
    rarity: 3,
    food: "シーザーサラダ（クルトン入り）",
    effect: "DP+1",
    personality: "爽やか・健康志向",
    description: "野菜を盛るのが好きな少年。"
  },

  // ★2
  {
    id: "onion_shoho",
    name: "玉ねぎ将補",
    rarity: 2,
    food: "黄玉ねぎ",
    effect: "DP+3",
    personality: "真面目・涙もろい",
    description: "炒めても煮ても万能な家庭料理の基礎素材。"
  },
  {
    id: "negi_fukucho",
    name: "万能ねぎ副長",
    rarity: 2,
    food: "小ねぎ（万能ねぎ）",
    effect: "DP+3",
    personality: "爽やか・気さく",
    description: "薬味としての汎用性が非常に高い素材。"
  },
  {
    id: "potato_chusa",
    name: "じゃが芋中佐",
    rarity: 2,
    food: "北海道産じゃがいも",
    effect: "DP+3",
    personality: "素朴・安定",
    description: "揚げ物・煮物・焼き物の全てで働く万能素材。"
  },
  {
    id: "carrot_nitohei",
    name: "にんじん二等兵",
    rarity: 2,
    food: "国産にんじん",
    effect: "DP+3",
    personality: "几帳面・真面目",
    description: "彩りと甘みで料理を支える縁の下の力持ち。"
  },
  {
    id: "cabbage_shihan",
    name: "キャベツ師範",
    rarity: 2,
    food: "春キャベツ",
    effect: "DP+3",
    personality: "のんびり・優しい",
    description: "千切りから炒め物まで活躍する多用途素材。"
  },
  {
    id: "egg_no1",
    name: "卵一号",
    rarity: 2,
    food: "国産たまご",
    effect: "DP+4",
    personality: "気まぐれ・柔らか",
    description: "焼いても煮ても混ぜても使える万能素材。"
  },
  {
    id: "butakoma_taiin",
    name: "豚こま隊員",
    rarity: 2,
    food: "豚こま切れ肉",
    effect: "DP+4",
    personality: "明るい・頑張り屋",
    description: "家庭の肉料理を幅広く支える存在。"
  },
  {
    id: "shirodashi_gunsou",
    name: "白だし軍曹",
    rarity: 2,
    food: "本格白だし（昆布＋かつお）",
    effect: "DP+3",
    personality: "穏やか・影の仕事人",
    description: "味の底を支える隠し味の名手。"
  },
  {
    id: "kinoko_ranger",
    name: "きのこレンジャー",
    rarity: 2,
    food: "ぶなしめじ",
    effect: "DP+3",
    personality: "落ち着き・素直",
    description: "和洋中すべてで香りを添える万能素材。"
  },
  {
    id: "aburaage_ani",
    name: "油あげ兄",
    rarity: 2,
    food: "厚めの油あげ",
    effect: "DP+3",
    personality: "陽気・軽い",
    description: "焼く・煮る・包む万能なサポート素材。"
  },

  // ★1
  {
    id: "kokokumai_kun",
    name: "古古古米くん",
    rarity: 1,
    food: "古古古米（30年以上前の米）",
    effect: "DP+1",
    personality: "短気・素朴",
    description: "古代の米の精。扱いが難しく粗削り。"
  },
  {
    id: "cucumber_heicho",
    name: "きゅうり兵長",
    rarity: 1,
    food: "生きゅうり",
    effect: "DP+1",
    personality: "冷静・水々しい",
    description: "カットするだけの初歩素材。"
  },
  {
    id: "tofu_tofusuke",
    name: "豆腐のトフ助",
    rarity: 1,
    food: "木綿豆腐",
    effect: "DP+1",
    personality: "柔らかい・控えめ",
    description: "形も味もまだ未完成。"
  },
  {
    id: "moyashi_sprint",
    name: "もやしスプリント",
    rarity: 1,
    food: "緑豆もやし",
    effect: "DP+1",
    personality: "軽い・元気",
    description: "扱いやすいが力は弱い。"
  },
  {
    id: "furunori_norimaru",
    name: "古海苔のノリ丸",
    rarity: 1,
    food: "古海苔（風味落ち）",
    effect: "DP+1",
    personality: "渋い・控えめ",
    description: "香りが弱くなった古い素材。"
  },
  {
    id: "dried_wakame_ji",
    name: "乾燥わかめ児",
    rarity: 1,
    food: "カットわかめ（乾燥）",
    effect: "DP+1",
    personality: "温和・地味",
    description: "戻さないと役に立たない素材。"
  },
  {
    id: "husuma_kko",
    name: "ふすまっ子",
    rarity: 1,
    food: "小麦ふすま",
    effect: "DP+1",
    personality: "素朴・やさしい",
    description: "使い道は限られるが栄養はある。"
  },
  {
    id: "konnyaku_edge",
    name: "切れ端こんにゃく坊",
    rarity: 1,
    food: "切れ端こんにゃく",
    effect: "DP+1",
    personality: "淡々・無口",
    description: "端材のため力は弱いが個性あり。"
  },
  {
    id: "toast_kun",
    name: "トーストくん",
    rarity: 1,
    food: "しなしなトースト",
    effect: "DP+1",
    personality: "明るい・早起き",
    description: "朝に強い少年。"
  },
  {
    id: "edamame_senpai",
    name: "枝豆先輩",
    rarity: 1,
    food: "冷凍枝豆（自然解凍）",
    effect: "DP+1",
    personality: "気楽・優しい",
    description: "つまみながら励ましてくれる先輩。"
  }
];
