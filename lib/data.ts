export const C_KEYS = ["soha","zainab","fatima","sam","alveena","missRahat","sirUzair","sirAdnan","imaan","tazeen","anna"] as const;
export const C_LABELS = ["Soha","Zainab Siraj","Fatima Rauf","Sam","Alveena","Miss Rahat","Sir Uzair","Sir Adnan","Imaan","Tazeen Miss","Anna"] as const;
export const X_KEYS = ["anna","imaan","soha","zainab","fatima","sam","alveena","missRahat","sirUzair","sirAdnan","tazeen"] as const;
export const X_LABELS = ["Anna","Imaan","Soha","Zainab Siraj","Fatima Rauf","Sam","Alveena","Miss Rahat","Sir Uzair","Sir Adnan","Tazeen Miss"] as const;
export const ALL_KEYS = ["soha","zainab","fatima","sam","alveena","missRahat","sirUzair","sirAdnan","imaan","tazeen","anna"] as const;
export const LABEL_MAP: Record<string,string> = {
  soha:"Soha", zainab:"Zainab Siraj", fatima:"Fatima Rauf", sam:"Sam", alveena:"Alveena",
  missRahat:"Miss Rahat", sirUzair:"Sir Uzair", sirAdnan:"Sir Adnan", imaan:"Imaan", tazeen:"Tazeen Miss", anna:"Anna"
};
export const KEY_MAP: Record<string,string> = Object.fromEntries(Object.entries(LABEL_MAP).map(([k,v])=>[v,k]));