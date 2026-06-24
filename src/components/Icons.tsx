/** 图标 sprite，对应原型里的 <symbol> 集合。用法：<Icon id="star" className="ic" /> */
export function IconSprite() {
  return (
    <svg style={{ display: "none" }}>
      <symbol id="i-search" viewBox="0 0 16 16"><path fill="currentColor" d="M10.68 11.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/></symbol>
      <symbol id="i-star" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></symbol>
      <symbol id="i-star-o" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"/></symbol>
      <symbol id="i-plus" viewBox="0 0 16 16"><path fill="currentColor" d="M7.25 2a.75.75 0 0 1 1.5 0v5.25H14a.75.75 0 0 1 0 1.5H8.75V14a.75.75 0 0 1-1.5 0V8.75H2a.75.75 0 0 1 0-1.5h5.25V2Z"/></symbol>
      <symbol id="i-eye" viewBox="0 0 16 16"><path fill="currentColor" d="M8 2c-3.5 0-6.2 2.7-7.4 5.3a1 1 0 0 0 0 .7C1.8 11.3 4.5 14 8 14s6.2-2.7 7.4-5.3a1 1 0 0 0 0-.7C14.2 4.7 11.5 2 8 2Zm0 9.5A3.25 3.25 0 1 1 8 5a3.25 3.25 0 0 1 0 6.5Z"/></symbol>
      <symbol id="i-bookmark" viewBox="0 0 16 16"><path fill="currentColor" d="M4 1.5h8A1.5 1.5 0 0 1 13.5 3v11.25a.75.75 0 0 1-1.175.618L8 12.16l-4.325 2.708A.75.75 0 0 1 2.5 14.25V3A1.5 1.5 0 0 1 4 1.5Z"/></symbol>
      <symbol id="i-bookmark-o" viewBox="0 0 16 16"><path fill="currentColor" d="M4 1.5h8A1.5 1.5 0 0 1 13.5 3v11.25a.75.75 0 0 1-1.175.618L8 12.16l-4.325 2.708A.75.75 0 0 1 2.5 14.25V3A1.5 1.5 0 0 1 4 1.5ZM4 3v9.713l3.6-2.255a.75.75 0 0 1 .8 0L12 12.713V3H4Z"/></symbol>
      <symbol id="i-copy" viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 2.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H4v-9.5h7v-.5a1 1 0 0 0-1-1h-6.5Zm3 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6.5a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6.5Z"/></symbol>
      <symbol id="i-lock" viewBox="0 0 16 16"><path fill="currentColor" d="M4 5V3.5a4 4 0 1 1 8 0V5h.25A1.75 1.75 0 0 1 14 6.75v6.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-6.5C2 5.78 2.78 5 3.75 5H4Zm1.5-1.5V5h5V3.5a2.5 2.5 0 0 0-5 0Z"/></symbol>
      <symbol id="i-arrow-left" viewBox="0 0 16 16"><path fill="currentColor" d="M7.78 12.78a.75.75 0 0 1-1.06 0L2.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L4.81 7.25H13a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"/></symbol>
      <symbol id="i-trend" viewBox="0 0 16 16"><path fill="currentColor" d="M1.75 13a.75.75 0 0 1-.75-.75V8.6a.75.75 0 0 1 1.5 0v3.65A.75.75 0 0 1 1.75 13Zm4-1.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v4.75a.75.75 0 0 1-.75.75Zm4-3a.75.75 0 0 1-.75-.75V4a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75Zm4-2a.75.75 0 0 1-.75-.75V2a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75Z"/></symbol>
      <symbol id="i-clock" viewBox="0 0 16 16"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9-3.5v3.25l2.27 1.36a.75.75 0 0 1-.77 1.28L7.5 8.91a.75.75 0 0 1-.5-.66V4.5a.75.75 0 0 1 1.5 0Z"/></symbol>
      <symbol id="i-upload" viewBox="0 0 16 16"><path fill="currentColor" d="M7.47 1.22a.75.75 0 0 1 1.06 0l3 3a.75.75 0 1 1-1.06 1.06L8.75 3.56V10a.75.75 0 0 1-1.5 0V3.56L5.53 5.28a.75.75 0 0 1-1.06-1.06l3-3ZM2.75 9.5a.75.75 0 0 1 .75.75v2.25c0 .14.11.25.25.25h8.5a.25.25 0 0 0 .25-.25V10.25a.75.75 0 0 1 1.5 0v2.25A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.5V10.25a.75.75 0 0 1 .75-.75Z"/></symbol>
    </svg>
  );
}

export function Icon({
  id,
  className,
  style,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg className={className ?? "ic"} style={style}>
      <use href={`#i-${id}`} />
    </svg>
  );
}
