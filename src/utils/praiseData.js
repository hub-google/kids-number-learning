/**
 * 誇獎詞庫 — 專為 4 歲小朋友設計
 * 每次獎勵時隨機挑選，語音 (TTS) 和文字會同步更新
 */

// ── 寫字完成時的小誇獎（playClap 用）──────────────────────
export const CLAP_PRAISES = [
  { text: '你好厲害！拍拍手！', emoji: '👏' },
  { text: '哇！寫得好漂亮喔！', emoji: '✨' },
  { text: '太棒了！給你拍拍手！', emoji: '👏' },
  { text: '哇～小手手好厲害！', emoji: '🖐️' },
  { text: '線條好順喔！太讚了！', emoji: '🌟' },
  { text: '你好認真！超級棒！', emoji: '💪' },
  { text: '耶！成功了！好厲害！', emoji: '🎉' },
  { text: '哇哇哇！太強了吧！', emoji: '😲' },
  { text: '一次比一次更厲害了！', emoji: '🚀' },
  { text: '出手即精品！滿分！', emoji: '💯' },
];

// ── 英雄獎勵（三星滿分時）──────────────────────────────
export const HERO_PRAISES = {
  transformer: [
    { text: '太棒了！變形金剛為你拍拍手！', display: '太棒了！\n變形金剛為你拍拍手！' },
    { text: '哇！你擁有超級力量！變形金剛超佩服你！', display: '你擁有超級力量！\n變形金剛超佩服你！' },
    { text: '太酷了！變形金剛說你是小天才！', display: '太酷了！\n變形金剛說你是小天才！' },
    { text: '嗶嗶！小英雄能量滿滿！變形金剛給你按讚！', display: '小英雄能量滿滿！\n變形金剛給你按讚！' },
    { text: '恭喜解鎖隱藏成就！變形金剛為你歡呼！', display: '解鎖隱藏成就！\n變形金剛為你歡呼！' },
    { text: '咻！火箭發射！變形金剛帶你衝！', display: '火箭發射！\n變形金剛帶你衝！' },
    { text: '太厲害了！變形金剛都為你驕傲！', display: '太厲害了！\n變形金剛都為你驕傲！' },
    { text: '哇～你的小手手有魔法！變形金剛也嚇到了！', display: '你的小手手有魔法！\n變形金剛也嚇到了！' },
  ],
  ultraman: [
    { text: '太棒了！奧特曼為你拍拍手！', display: '太棒了！\n奧特曼為你拍拍手！' },
    { text: '哇！奧特曼等級的超級力量！你太強了！', display: '奧特曼等級的超級力量！\n你太強了！' },
    { text: '太神了！奧特曼說你是小天才！', display: '太神了！\n奧特曼說你是小天才！' },
    { text: '奧特曼為你送出大大的愛心！你最棒了！', display: '送出大大的愛心！\n你最棒了！' },
    { text: '直接破關成功！奧特曼英雄降臨為你歡呼！', display: '破關成功！\n奧特曼英雄降臨！' },
    { text: '哇！閃閃發光！奧特曼覺得你超級厲害！', display: '閃閃發光！\n奧特曼覺得你超厲害！' },
    { text: '給你一個超級大擁抱！奧特曼最愛你了！', display: '超級大擁抱！\n奧特曼最愛你了！' },
    { text: '能量指數爆表！奧特曼跟你一起歡呼！', display: '能量指數爆表！\n奧特曼跟你一起歡呼！' },
  ],
};

// ── 分數評語（寫好了按鈕之後的結果卡）─────────────────
export const SCORE_TITLES = {
  3: [
    '🎉 太棒了！',
    '🎉 太厲害了！',
    '🎉 簡直滿分！',
    '🎉 完美！',
    '🎉 小天才！',
    '🎉 哇哇哇！',
  ],
  2: [
    '👍 不錯喔！',
    '👍 很棒唷！',
    '👍 再加一點點！',
    '👍 快完美了！',
    '👍 越來越厲害！',
  ],
  1: [
    '💪 再試一次！',
    '💪 加油加油！',
    '💪 差一點點！',
    '💪 你可以的！',
    '💪 再來一次！',
  ],
};

// ── 隨機選取工具 ────────────────────────────────────
let lastClapIndex = -1;
let lastHeroIndex = { transformer: -1, ultraman: -1 };
let lastScoreIndex = { 1: -1, 2: -1, 3: -1 };

function randomDifferent(arr, lastIdx) {
  if (arr.length <= 1) return { item: arr[0], index: 0 };
  let idx;
  do {
    idx = Math.floor(Math.random() * arr.length);
  } while (idx === lastIdx);
  return { item: arr[idx], index: idx };
}

export function getRandomClap() {
  const { item, index } = randomDifferent(CLAP_PRAISES, lastClapIndex);
  lastClapIndex = index;
  return item;
}

export function getRandomHeroPraise(heroType) {
  const list = HERO_PRAISES[heroType] || HERO_PRAISES.transformer;
  const { item, index } = randomDifferent(list, lastHeroIndex[heroType] ?? -1);
  lastHeroIndex[heroType] = index;
  return item;
}

export function getRandomScoreTitle(score) {
  const list = SCORE_TITLES[score] || SCORE_TITLES[1];
  const { item, index } = randomDifferent(list, lastScoreIndex[score] ?? -1);
  lastScoreIndex[score] = index;
  return item;
}
