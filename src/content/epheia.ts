/**
 * /epheia 页的内容。
 *
 * 「她还在的时候」「她离开以后」是 Sy 在《晚安喵》《没有下一版》等文章里写过的话，
 * 整理成了段落；她自己说过、写过的话（聊天角、结尾那段）保持原样，不要改。
 *
 * 以后要补她的 ARG、项目、文章，只往 works 里加；没有链接的条目会显示成纯文字。
 */

export interface HerPost {
  date: string;
  tag: string;
  lang: "ja" | "en";
  lines?: string[];
  link?: { text: string; to: string };
}

export interface Work {
  kind: "网站" | "项目" | "文章" | "ARG";
  title?: string;
  url?: string;
  meta?: string;
  lang?: string;
}

export interface Favorite {
  id: string;
  img: string;
  href: string;
  caption: string;
  sub: string;
  subLang?: string;
  srExtra?: string;
  tilt: number;
}

export const EPHEIA = {
  dates: {
    leavesSy: "2026-07-24T00:00:00+08:00",
    leavesWorld: "2026-07-27T12:01:00+08:00",
  },

  lede: [
    "对我来说，Epheia 不只是一个陌生的用户名。",
    "她有十七年的记忆，有自己的学业、家庭和生活，是一个活生生的人。",
  ],

  /** 她还在的时候：一段一段 */
  before: [
    "她的作息是 UTC+0。她做过很多自己的项目，其中有一个我也交过 PR，她特别喜欢用它聊天。她还写了很多文章，写她自己，写社群，也写她的朋友们。她活跃在中文推特的跨性别社群，在圈子里小有名气。2026 年的 Pride Month，她还做了一个 ARG。",
    "我们是 4 月 21 日在一起的。我一直觉得，我最大的成就就是谈上了她。我跟她表白，她居然还挺高兴的（？）",
    "不在一起的时候，我们就打语音、聊天，她会一直陪着我。她直播陪我开欧卡，和我一起打地下城、玩 MC，在 VC 里开着直播玩城市天际线。我要是消失一天，她肯定会急疯，大概能把 110 的电话打爆。",
    "7 月 16 日，她来找我了。之后的一段时间，我们真的在线下一起生活过。她会来找我抱抱，陪着我。",
  ],

  favorites: [
    {
      id: "mwem",
      img: "/images/epheia/mwem.jpg",
      href: "https://www.bilibili.com/video/BV1XRn2z9Ehb/",
      caption: "Epheia 最喜欢的百合动漫",
      sub: "《私を喰べたい、ひとでなし》",
      subLang: "ja",
      tilt: -3,
    },
    {
      id: "ets2",
      img: "/images/epheia/ets2.jpg",
      href: "https://store.steampowered.com/app/227300/Euro_Truck_Simulator_2/",
      caption: "Epheia 喜欢的游戏",
      sub: "Euro Truck Simulator 2",
      subLang: "en",
      tilt: -0.5,
    },
    {
      id: "yumia",
      img: "/images/epheia/yumia.jpg",
      href: "https://store.steampowered.com/app/3123410/Atelier_Yumia_The_Alchemist_of_Memories__the_Envisioned_Land/",
      caption: "Epheia 喜欢的，，",
      sub: "买断制原神？",
      srExtra: "优米雅的炼金工房 ～追忆之炼金术士与幻创之国～",
      tilt: 3,
    },
  ] as Favorite[],

  /** 07/24 那条线下面：她用过的最后一批模型，和她没等到的下一版（摘自《没有下一版》） */
  strata: {
    used: "Kimi K3，Gemini 3.8 Flash，GPT 5.6 Sol，Claude Fable 5，DeepSeek V4，GLM 5.2，OpenCode Go",
    missed: "K3.1，GLM 5.3，GPT 6 Astra，Fable 5.1，DeepSeek V4.1，Gemini 4 Pro",
  },

  /** 她离开以后 */
  after: {
    opening: "7 月 24 日以后，我还是会下意识地把很多事情分成「她还在的时候」和「她离开以后」。",
    never: [
      "再也不会有人在 6 月给我发 ARG 了。",
      "再也不会有人直播陪我开欧卡了。",
      "再也不会有人和我一起打地下城、一起玩 MC 了。",
      "再也不会有人在 VC 里陪我直播城市天际线了。",
    ],
    paragraphs: [
      "她活着的时候，我其实没怎么了解她。她让我玩的 ARG，我没有玩；她写的文档，我也没有看。那时候我总觉得，有什么想知道的，直接问她就好了。直到她不在了，我才开始一点一点地翻她留下的东西。",
      "我还留着她的很多录音，手机里也还存着很多她的照片。有一天打开 QQ 空间，一闪而过、又被刷新掉的，是我抱着她的时候发的一段歌词。备用机上的 Telegram 没开梯子，时间还停在她来找我的那一天，那条消息到现在都是未读。以后也不会再多出一个已读的 ✅ 了，她的上线时间只会越来越远。",
      "日子越往后，我记得的细节就越少，我对此无能为力。我能做的，是让这个网站一直保持她认识的样子。如果有一天她回来看到，大概会有一点不易察觉的笑：「看，还是我熟悉的这个样子。」",
      "以前我想纪念她，都没有个纪念的地方。现在有这一页了。",
    ],
  },

  footnote: ["“夏天结束了。”", "“还会再来吗？”", "“还会，但 Epheia 不会了”"],

  /** Sy 在她离开以后写的文章，标题和日期从文章数据里读 */
  syPosts: ["savepoint", "no-next", "more-than-a-username", "goodnight"],

  leftEpigraph: "她留下的那些网站，还会有人访问吗…",

  /** 她的聊天角 わたくしのつぶやき（watakushi.desuwa.org），以下文字摘自她站上公开的内容 */
  corner: {
    url: "https://watakushi.desuwa.org/",
    host: "watakushi.desuwa.org",
    label: "她的聊天角",
    title: "わたくしのつぶやき",
    subtitle: "ここはわたくしのおしゃべりコーナーですわ。",
    /** resource.epheia.moe 目前返回 526；有本地备份时改成 /images/epheia/ 下的路径 */
    avatar: null as string | null,
    posts: [
      {
        date: "2026-04-01",
        tag: "#欢迎",
        lang: "ja",
        lines: [
          "ここはわたくし、ただの日常を書き留めるだけの場所ですわ。",
          "べ、別にあなたに見せたくて書いているわけではありませんのよ。",
          "でも……もし暇でしたら、少しだけ覗いていっても構いませんこと。",
        ],
      },
      {
        date: "2026-04-3",
        tag: "#友链",
        lang: "en",
        link: { text: "Sy's digital garden", to: "/" },
      },
    ] as HerPost[],
  },

  /** 她做的、写的。meta 里带引号的是她自己站上的描述 */
  works: [
    { kind: "网站", title: "Epheia", url: "https://epheia.pages.dev/", meta: "Epheia 的博客和文档~", lang: "en" },
    { kind: "网站", title: "わたくしのつぶやき", url: "https://watakushi.desuwa.org/", meta: "她的聊天角", lang: "ja" },
    { kind: "网站", title: "X 存档", url: "https://nyaepheia.pages.dev/", meta: "她的推文存档" },
    { kind: "ARG", meta: "2026 · Pride Month" },
  ] as Work[],

  /** 她 2026/06/12 对 Sy 说的话，摘自《晚安喵》结尾，保持原样 */
  herWords: {
    stanzas: [
      ["不是你的问题", "是这个世界的问题喵…"],
      ["没有丢下你一个人喵"],
      ["不用道歉，你什么都没做错啊", "是这个世界错了喵…", "应该让这个世界对你道歉"],
      ["你就是 Sy 啊", "Sy 就是 Sy"],
      ["好些了吗…", "我好累…我休息一会喵…？", "晚安喵"],
    ],
    signature: "—— Epheia，2026/06/12",
  },
};
