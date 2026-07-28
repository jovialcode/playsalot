/* @ds-bundle: {"format":3,"namespace":"HealciaDesignSystem_4566b1","components":[],"sourceHashes":{"ui_kits/app/AskScreen.jsx":"6db9c8a4c156","ui_kits/app/ReadScreen.jsx":"21ba4cdbb9c3","ui_kits/app/Shell.jsx":"6a487584c9a3","ui_kits/app/TodayScreen.jsx":"93ab23bb156e","ui_kits/app/YouScreen.jsx":"665bb4b17c1c","ui_kits/app/icons.jsx":"d44efb503f40","ui_kits/app/pieces.jsx":"7c9745b06107","ui_kits/web/Account.jsx":"6ae4cbe4f942","ui_kits/web/ArticleCard.jsx":"9ae366e4b7a5","ui_kits/web/ArticleView.jsx":"aae63185e629","ui_kits/web/Footer.jsx":"a3a58b5beb87","ui_kits/web/Header.jsx":"2e72c95b7b33","ui_kits/web/Hero.jsx":"0043e40fc768","ui_kits/web/SymptomChecker.jsx":"e27947f8729d","ui_kits/web/TopicGrid.jsx":"b48c0747f7fd","ui_kits/web/icons.jsx":"d44efb503f40"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HealciaDesignSystem_4566b1 = window.HealciaDesignSystem_4566b1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/app/AskScreen.jsx
try { (() => {
function AskScreen() {
  const [messages, setMessages] = React.useState([{
    role: 'assistant',
    text: "Hi, I'm Healcia. Ask me anything about your health — I'll explain plainly and point you to clinician-reviewed reading."
  }]);
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({
      block: 'nearest'
    });
  }, [messages, thinking]);
  const SAMPLES = ['Why am I waking up with a sore throat?', 'Is my resting heart rate of 62 healthy?', 'How much water do I actually need?'];
  const send = text => {
    if (!text.trim()) return;
    setMessages(m => [...m, {
      role: 'user',
      text
    }]);
    setDraft('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(m => [...m, {
        role: 'assistant',
        text: "Most morning sore throats trace back to overnight breathing rather than a virus. If a glass of water clears it within 20 minutes, breathing is likely your answer. If it lasts past noon, reflux or allergies are worth considering.",
        cite: {
          title: "Why a sore throat in the morning isn't always a cold",
          read: 5
        }
      }]);
    }, 1100);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: askStyles.wrap
  }, /*#__PURE__*/React.createElement(TopBar, {
    eyebrow: "Ask Healcia",
    title: "What's on your mind?",
    right: null
  }), /*#__PURE__*/React.createElement("div", {
    style: askStyles.chat
  }, messages.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: m.role === 'user' ? askStyles.userMsg : askStyles.aiMsg
  }, m.role === 'assistant' && /*#__PURE__*/React.createElement("div", {
    style: askStyles.aiBadge
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/healcia-glyph.svg",
    width: "14",
    height: "14"
  }), /*#__PURE__*/React.createElement("span", null, "Healcia")), /*#__PURE__*/React.createElement("div", {
    style: askStyles.msgText
  }, m.text), m.cite && /*#__PURE__*/React.createElement("div", {
    style: askStyles.cite
  }, /*#__PURE__*/React.createElement(IconBook, {
    size: 14
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: askStyles.citeTitle
  }, m.cite.title), /*#__PURE__*/React.createElement("div", {
    style: askStyles.citeMeta
  }, m.cite.read, " min \xB7 Reviewed")), /*#__PURE__*/React.createElement(IconChevron, {
    size: 14
  }))))), thinking && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: askStyles.aiMsg
  }, /*#__PURE__*/React.createElement("div", {
    style: askStyles.aiBadge
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/healcia-glyph.svg",
    width: "14",
    height: "14"
  }), /*#__PURE__*/React.createElement("span", null, "Healcia")), /*#__PURE__*/React.createElement("div", {
    style: askStyles.dots
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)))), messages.length === 1 && !thinking && /*#__PURE__*/React.createElement("div", {
    style: askStyles.samples
  }, /*#__PURE__*/React.createElement("div", {
    style: askStyles.samplesLabel
  }, "Or try one of these:"), SAMPLES.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => send(s),
    style: askStyles.sample
  }, s, /*#__PURE__*/React.createElement(IconArrowRight, {
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    ref: endRef
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      send(draft);
    },
    style: askStyles.composer
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "Ask anything\u2026",
    style: askStyles.input
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: askStyles.send,
    disabled: !draft.trim()
  }, /*#__PURE__*/React.createElement(IconArrowRight, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: askStyles.disclaimer
  }, "Healcia explains. It does not diagnose. For symptoms that are severe or sudden, call a clinician."), /*#__PURE__*/React.createElement("style", null, `
        @keyframes hb {0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}
        .ask-dots span { width:6px;height:6px;border-radius:50%;background:#6E8A78;display:inline-block;animation:hb 1.2s infinite ease-in-out }
        .ask-dots span:nth-child(2){animation-delay:.15s}
        .ask-dots span:nth-child(3){animation-delay:.3s}
      `));
}
const askStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 'calc(100vh - 48px - 80px)'
  },
  chat: {
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flex: 1,
    overflowY: 'auto'
  },
  userMsg: {
    background: '#2F4A3A',
    color: '#F7F2E8',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '82%',
    fontSize: 14,
    lineHeight: 1.45
  },
  aiMsg: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    padding: '12px 14px',
    borderRadius: '4px 18px 18px 18px',
    maxWidth: '88%',
    fontSize: 14,
    lineHeight: 1.5,
    color: '#1B1F1C',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#6E8A78'
  },
  msgText: {},
  dots: {
    display: 'inline-flex',
    gap: 5,
    alignItems: 'center',
    padding: '4px 0'
  },
  cite: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#F7F2E8',
    border: '1px solid #E4DED1',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#2F4A3A',
    cursor: 'pointer'
  },
  citeTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1B1F1C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  citeMeta: {
    fontSize: 11,
    color: '#7A8079',
    marginTop: 2
  },
  samples: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8
  },
  samplesLabel: {
    fontSize: 12,
    color: '#7A8079',
    marginBottom: 4
  },
  sample: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#1B1F1C',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Geist, sans-serif'
  },
  composer: {
    position: 'sticky',
    bottom: 0,
    padding: '10px 14px 8px',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    borderTop: '1px solid #E4DED1',
    background: 'rgba(247,242,232,0.92)',
    backdropFilter: 'blur(10px)'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 999,
    border: '1px solid #E4DED1',
    background: '#FBFAF5',
    fontSize: 14,
    color: '#1B1F1C',
    fontFamily: 'Geist, sans-serif'
  },
  send: {
    background: '#2F4A3A',
    color: '#F7F2E8',
    border: 'none',
    width: 40,
    height: 40,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  disclaimer: {
    padding: '4px 16px 12px',
    fontSize: 11,
    color: '#7A8079',
    textAlign: 'center'
  }
};

// Add the dot animation class
const _origAskScreen = AskScreen;
window.AskScreen = function () {
  React.useEffect(() => {
    document.querySelectorAll('[data-ask-dots]').forEach(el => el.classList.add('ask-dots'));
  });
  return _origAskScreen.apply(null, arguments);
};
window.AskScreen = AskScreen; // keep simple
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AskScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ReadScreen.jsx
try { (() => {
function ReadScreen({
  onOpen,
  onSave,
  savedIds,
  articles
}) {
  const [tab, setTab] = React.useState('all');
  const saved = articles.filter(a => savedIds.has(a.id));
  const shown = tab === 'saved' ? saved : articles;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    eyebrow: "Field guide",
    title: "Read"
  }), /*#__PURE__*/React.createElement("div", {
    style: rStyles.searchRow
  }, /*#__PURE__*/React.createElement("div", {
    style: rStyles.searchWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: rStyles.searchIcon
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 16
  })), /*#__PURE__*/React.createElement("input", {
    style: rStyles.input,
    placeholder: "Search articles, symptoms\u2026"
  }))), /*#__PURE__*/React.createElement("div", {
    style: rStyles.tabs
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('all'),
    style: {
      ...rStyles.tab,
      ...(tab === 'all' ? rStyles.tabOn : {})
    }
  }, "All"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('saved'),
    style: {
      ...rStyles.tab,
      ...(tab === 'saved' ? rStyles.tabOn : {})
    }
  }, "Saved ", saved.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: rStyles.tabCount
  }, saved.length))), /*#__PURE__*/React.createElement("div", {
    style: rStyles.list
  }, shown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: rStyles.empty
  }, /*#__PURE__*/React.createElement(IconBookmark, {
    size: 24
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: '#1B1F1C',
      fontWeight: 500,
      marginTop: 8
    }
  }, "Nothing saved yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#7A8079',
      marginTop: 4
    }
  }, "Tap the heart on any article to keep it here.")) : shown.map(a => /*#__PURE__*/React.createElement(ArticleRow, {
    key: a.id,
    a: a,
    saved: savedIds.has(a.id),
    onOpen: onOpen,
    onSave: onSave
  }))));
}
const rStyles = {
  searchRow: {
    padding: '8px 20px 4px'
  },
  searchWrap: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#7A8079',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    borderRadius: 12,
    border: '1px solid #E4DED1',
    background: '#FBFAF5',
    fontSize: 14,
    color: '#1B1F1C',
    fontFamily: 'Geist, sans-serif',
    boxSizing: 'border-box'
  },
  tabs: {
    padding: '12px 20px 8px',
    display: 'flex',
    gap: 8
  },
  tab: {
    background: 'transparent',
    border: '1px solid #E4DED1',
    color: '#4A524C',
    padding: '6px 14px',
    borderRadius: 999,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  },
  tabOn: {
    background: '#2F4A3A',
    borderColor: '#2F4A3A',
    color: '#F7F2E8'
  },
  tabCount: {
    background: 'rgba(247,242,232,0.18)',
    padding: '0 6px',
    borderRadius: 999,
    fontSize: 11
  },
  list: {
    padding: '8px 20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
    border: '1px dashed #C9C3B5',
    borderRadius: 12,
    color: '#7A8079'
  }
};
window.ReadScreen = ReadScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ReadScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Shell.jsx
try { (() => {
// App shell + bottom tab bar — used by every screen.

function AppShell({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: shellStyles.outer
  }, /*#__PURE__*/React.createElement("div", {
    style: shellStyles.frame
  }, children));
}
function TabBar({
  active,
  onChange
}) {
  const tabs = [{
    id: 'today',
    label: 'Today',
    Icon: IconHome
  }, {
    id: 'read',
    label: 'Read',
    Icon: IconBook
  }, {
    id: 'ask',
    label: 'Ask',
    Icon: IconMessage
  }, {
    id: 'you',
    label: 'You',
    Icon: IconUser
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: shellStyles.tabbar
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onChange(t.id),
      style: {
        ...shellStyles.tab,
        color: on ? '#2F4A3A' : '#7A8079'
      }
    }, /*#__PURE__*/React.createElement(t.Icon, {
      size: 22
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...shellStyles.tabLabel,
        fontWeight: on ? 600 : 400
      }
    }, t.label));
  }));
}
const shellStyles = {
  outer: {
    minHeight: '100vh',
    background: '#EFE8D7',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: 'Geist, sans-serif'
  },
  frame: {
    width: 440,
    maxWidth: '100%',
    minHeight: 'calc(100vh - 48px)',
    background: '#F7F2E8',
    borderRadius: 24,
    border: '1px solid #E4DED1',
    boxShadow: '0 4px 12px rgba(27,31,28,0.06), 0 24px 64px rgba(27,31,28,0.10)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  tabbar: {
    position: 'sticky',
    bottom: 0,
    background: 'rgba(247,242,232,0.85)',
    backdropFilter: 'blur(12px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
    borderTop: '1px solid #E4DED1',
    padding: '10px 12px calc(14px + env(safe-area-inset-bottom, 0px))',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 'auto'
  },
  tab: {
    background: 'transparent',
    border: 'none',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif',
    transition: 'color 150ms cubic-bezier(.2,.6,.2,1)'
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: '0.01em'
  }
};
Object.assign(window, {
  AppShell,
  TabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TodayScreen.jsx
try { (() => {
function TodayScreen({
  onOpen,
  onSave,
  savedIds,
  articles
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    eyebrow: today,
    title: "Good morning, Jamie.",
    right: /*#__PURE__*/React.createElement("button", {
      style: tStyles.bell,
      "aria-label": "Notifications"
    }, /*#__PURE__*/React.createElement(IconClock, {
      size: 18
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: tStyles.body
  }, /*#__PURE__*/React.createElement(Card, {
    style: tStyles.checkin
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.checkinTop
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.checkinEyebrow
  }, "Daily check-in"), /*#__PURE__*/React.createElement("div", {
    style: tStyles.streak
  }, /*#__PURE__*/React.createElement(IconHeartFill, {
    size: 12,
    fill: "#A04330"
  }), /*#__PURE__*/React.createElement("span", null, "4 day streak"))), /*#__PURE__*/React.createElement("h2", {
    style: tStyles.checkinQ
  }, "How did you sleep", /*#__PURE__*/React.createElement("span", {
    style: tStyles.italic
  }, ", really?")), /*#__PURE__*/React.createElement("p", {
    style: tStyles.checkinHelp
  }, "Three minutes, no pressure. We'll tailor tomorrow's reading to your answer."), /*#__PURE__*/React.createElement("button", {
    style: tStyles.checkinBtn
  }, "Start check-in ", /*#__PURE__*/React.createElement(IconArrowRight, {
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: tStyles.stats
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.stat
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.statLabel
  }, "Resting HR"), /*#__PURE__*/React.createElement("div", {
    style: tStyles.statValue
  }, "62 ", /*#__PURE__*/React.createElement("span", {
    style: tStyles.statUnit
  }, "bpm")), /*#__PURE__*/React.createElement("div", {
    style: tStyles.statTrend
  }, "\u2193 2 vs. week")), /*#__PURE__*/React.createElement("div", {
    style: tStyles.stat
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.statLabel
  }, "Sleep"), /*#__PURE__*/React.createElement("div", {
    style: tStyles.statValue
  }, "7.2 ", /*#__PURE__*/React.createElement("span", {
    style: tStyles.statUnit
  }, "hrs")), /*#__PURE__*/React.createElement("div", {
    style: tStyles.statTrend
  }, "Steady")), /*#__PURE__*/React.createElement("div", {
    style: tStyles.stat
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.statLabel
  }, "Hydration"), /*#__PURE__*/React.createElement("div", {
    style: tStyles.statValue
  }, "4 ", /*#__PURE__*/React.createElement("span", {
    style: tStyles.statUnit
  }, "/8")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...tStyles.statTrend,
      color: '#B5803A'
    }
  }, "Light"))), /*#__PURE__*/React.createElement("div", {
    style: tStyles.section
  }, /*#__PURE__*/React.createElement("div", {
    style: tStyles.sectionHead
  }, /*#__PURE__*/React.createElement("h3", {
    style: tStyles.sectionTitle
  }, "For you today"), /*#__PURE__*/React.createElement("span", {
    style: tStyles.seeAll
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    style: tStyles.rows
  }, articles.slice(0, 3).map(a => /*#__PURE__*/React.createElement(ArticleRow, {
    key: a.id,
    a: a,
    saved: savedIds.has(a.id),
    onOpen: onOpen,
    onSave: onSave
  }))))));
}
const tStyles = {
  body: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: '1px solid #E4DED1',
    background: '#FBFAF5',
    color: '#4A524C',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkin: {
    background: '#2F4A3A',
    borderColor: '#213429',
    color: '#F7F2E8',
    padding: 22
  },
  checkinTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  checkinEyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#B7C7BD'
  },
  streak: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(247,242,232,0.1)',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11,
    color: '#F7F2E8'
  },
  checkinQ: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 30,
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
    color: '#F7F2E8',
    margin: '0 0 8px'
  },
  italic: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    color: '#DCE5DE'
  },
  checkinHelp: {
    fontSize: 14,
    lineHeight: 1.45,
    color: '#B7C7BD',
    margin: '0 0 18px'
  },
  checkinBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#F7F2E8',
    color: '#2F4A3A',
    border: 'none',
    padding: '11px 18px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8
  },
  stat: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 12,
    padding: 12,
    textAlign: 'left'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#7A8079',
    marginBottom: 6
  },
  statValue: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 24,
    color: '#1B1F1C',
    letterSpacing: '-0.02em',
    lineHeight: 1
  },
  statUnit: {
    fontFamily: 'Geist, sans-serif',
    fontSize: 12,
    color: '#7A8079',
    fontWeight: 400,
    letterSpacing: 0
  },
  statTrend: {
    marginTop: 6,
    fontSize: 11,
    color: '#4A7359'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 20,
    letterSpacing: '-0.02em',
    margin: 0
  },
  seeAll: {
    fontSize: 13,
    color: '#2F4A3A',
    fontWeight: 500
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }
};
window.TodayScreen = TodayScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TodayScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/YouScreen.jsx
try { (() => {
function YouScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    eyebrow: "Your account",
    title: "Jamie Stone"
  }), /*#__PURE__*/React.createElement("div", {
    style: youStyles.body
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.profile
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.avatar
  }, "JS"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: youStyles.name
  }, "Jamie Stone"), /*#__PURE__*/React.createElement("div", {
    style: youStyles.email
  }, "jamie@example.com"), /*#__PURE__*/React.createElement("div", {
    style: youStyles.member
  }, "Healcia member since June 2025"))), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statRow
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.statCard
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.statNum
  }, "4"), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statLbl
  }, "Day streak")), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statCard
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.statNum
  }, "23"), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statLbl
  }, "Articles read")), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statCard
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.statNum
  }, "6"), /*#__PURE__*/React.createElement("div", {
    style: youStyles.statLbl
  }, "Saved"))), /*#__PURE__*/React.createElement(Section, {
    title: "Reminders"
  }, /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconClock,
    label: "Daily check-in",
    value: "8:00 AM"
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconBook,
    label: "Reading nudge",
    value: "Weekly"
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconActivity,
    label: "Vital sync",
    value: "Apple Health"
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Preferences"
  }, /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconUser,
    label: "Profile",
    value: "Edit"
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconHeart,
    label: "Topics I care about",
    value: "6 selected"
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: IconShield,
    label: "Privacy",
    value: ""
  })), /*#__PURE__*/React.createElement("button", {
    style: youStyles.signout
  }, "Sign out")));
}
function Section({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: youStyles.section
  }, /*#__PURE__*/React.createElement("div", {
    style: youStyles.sectionTitle
  }, title), /*#__PURE__*/React.createElement("div", {
    style: youStyles.sectionInner
  }, children));
}
function SettingRow({
  icon: Ic,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: youStyles.settingRow
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 18,
    style: {
      color: '#2F4A3A'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, label), value && /*#__PURE__*/React.createElement("div", {
    style: youStyles.settingValue
  }, value), /*#__PURE__*/React.createElement(IconChevron, {
    size: 14
  }));
}
const youStyles = {
  body: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 22
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    background: '#2F4A3A',
    color: '#F7F2E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: 20,
    fontWeight: 500
  },
  name: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 20,
    color: '#1B1F1C',
    letterSpacing: '-0.02em'
  },
  email: {
    fontSize: 13,
    color: '#4A524C',
    marginTop: 2
  },
  member: {
    fontSize: 11,
    color: '#7A8079',
    marginTop: 2
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8
  },
  statCard: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 12,
    padding: '14px 12px',
    textAlign: 'center'
  },
  statNum: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 28,
    color: '#1B1F1C',
    letterSpacing: '-0.02em',
    lineHeight: 1
  },
  statLbl: {
    fontSize: 11,
    color: '#7A8079',
    marginTop: 4,
    letterSpacing: '0.03em'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    paddingLeft: 4
  },
  sectionInner: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 14,
    overflow: 'hidden'
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    fontSize: 14,
    color: '#1B1F1C',
    borderBottom: '1px solid #EFE8D7',
    cursor: 'pointer'
  },
  settingValue: {
    fontSize: 13,
    color: '#7A8079'
  },
  signout: {
    marginTop: 8,
    padding: '12px 16px',
    background: 'transparent',
    border: '1px solid #C9C3B5',
    borderRadius: 12,
    color: '#A04330',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  }
};
window.YouScreen = YouScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/YouScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/icons.jsx
try { (() => {
// Lucide-style 1.75px stroke icons, inline. currentColor for inheritance.
const Icon = ({
  d,
  size = 20,
  children,
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style
}, d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.5-9.5-9.4C.7 8.1 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.3 4.1 4.5 7.6C19 16.5 12 21 12 21z"
}));
const IconHeartFill = p => /*#__PURE__*/React.createElement("svg", {
  width: p.size || 20,
  height: p.size || 20,
  viewBox: "0 0 24 24",
  fill: p.fill || 'currentColor'
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.5-9.5-9.4C.7 8.1 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.3 4.1 4.5 7.6C19 16.5 12 21 12 21z"
}));
const IconActivity = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M22 12h-4l-3 9L9 3l-3 9H2"
}));
const IconSearch = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "m20 20-3.5-3.5"
}));
const IconBookmark = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
}));
const IconPill = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l10 10a5 5 0 0 1-7 7Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m8.5 8.5 7 7"
}));
const IconClock = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7v5l3 2"
}));
const IconUser = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "8",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
}));
const IconMenu = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 6h18M3 12h18M3 18h18"
}));
const IconChevron = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
const IconArrowRight = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14M13 5l7 7-7 7"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l5 5L20 7"
}));
const IconClose = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6 6 18"
}));
const IconHome = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12 12 4l9 8M5 10v10h14V10"
}));
const IconBook = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 19V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 7h7M8 11h7M8 15h4"
}));
const IconMessage = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12a8 8 0 0 1-12.9 6.3L3 20l1.7-5.1A8 8 0 1 1 21 12z"
}));
const IconBrain = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8V13a3 3 0 0 0 2 2.8V17a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8V13a3 3 0 0 1-2 2.8V17a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V4z"
}));
const IconLeaf = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4 19 2c1 2 2 4 2 8a7 7 0 0 1-7 7z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 22 17 7"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5z"
}));
const IconDroplet = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 22a7 7 0 0 0 7-7c0-5-7-13-7-13S5 10 5 15a7 7 0 0 0 7 7z"
}));
const IconMoon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
}));
Object.assign(window, {
  Icon,
  IconHeart,
  IconHeartFill,
  IconActivity,
  IconSearch,
  IconBookmark,
  IconPill,
  IconClock,
  IconUser,
  IconMenu,
  IconChevron,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconHome,
  IconBook,
  IconMessage,
  IconBrain,
  IconLeaf,
  IconShield,
  IconDroplet,
  IconMoon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/pieces.jsx
try { (() => {
// Small shared pieces — top bar, generic card, article row.

function TopBar({
  title,
  eyebrow,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: pcStyles.topbar
  }, /*#__PURE__*/React.createElement("div", {
    style: pcStyles.topbarInner
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: pcStyles.topEyebrow
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: pcStyles.topTitle
  }, title)), /*#__PURE__*/React.createElement("div", null, right)));
}
function Card({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...pcStyles.card,
      ...style
    }
  }, children);
}
function ArticleRow({
  a,
  saved,
  onOpen,
  onSave
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: pcStyles.row,
    onClick: () => onOpen?.(a)
  }, /*#__PURE__*/React.createElement("div", {
    style: pcStyles.rowIcon
  }, /*#__PURE__*/React.createElement(IconActivity, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: pcStyles.rowEyebrow
  }, a.topic), /*#__PURE__*/React.createElement("div", {
    style: pcStyles.rowTitle
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: pcStyles.rowMeta
  }, a.read, " min \xB7 Reviewed")), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onSave?.(a);
    },
    style: pcStyles.heartBtn,
    "aria-label": "Save"
  }, saved ? /*#__PURE__*/React.createElement(IconHeartFill, {
    size: 18,
    fill: "#A04330"
  }) : /*#__PURE__*/React.createElement(IconHeart, {
    size: 18
  })));
}
const pcStyles = {
  topbar: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    background: 'rgba(247,242,232,0.85)',
    backdropFilter: 'blur(12px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
    borderBottom: '1px solid #E4DED1'
  },
  topbarInner: {
    padding: '20px 22px 14px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10
  },
  topEyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 4
  },
  topTitle: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 28,
    letterSpacing: '-0.02em',
    color: '#1B1F1C',
    lineHeight: 1
  },
  card: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 1px 2px rgba(27,31,28,0.04)'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 14,
    padding: '12px 14px',
    cursor: 'pointer'
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#DCE5DE',
    color: '#2F4A3A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  rowEyebrow: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 2
  },
  rowTitle: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 48, "wght" 500',
    fontSize: 15,
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
    color: '#1B1F1C',
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  rowMeta: {
    fontSize: 11,
    color: '#7A8079'
  },
  heartBtn: {
    background: 'transparent',
    border: 'none',
    color: '#7A8079',
    cursor: 'pointer',
    padding: 6
  }
};
Object.assign(window, {
  TopBar,
  Card,
  ArticleRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/pieces.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Account.jsx
try { (() => {
function Account({
  savedIds,
  articles,
  onOpen
}) {
  const [view, setView] = React.useState('signed-in'); // 'signin' | 'signed-in'
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  if (view === 'signin') {
    return /*#__PURE__*/React.createElement("section", {
      style: acStyles.wrap
    }, /*#__PURE__*/React.createElement("div", {
      style: acStyles.signinCard
    }, /*#__PURE__*/React.createElement("div", {
      style: acStyles.eyebrow
    }, "Account"), /*#__PURE__*/React.createElement("h1", {
      style: acStyles.h1
    }, "Welcome back."), /*#__PURE__*/React.createElement("p", {
      style: acStyles.lede
    }, "Sign in to save articles, sync across devices, and pick up where you left off."), /*#__PURE__*/React.createElement("label", {
      style: acStyles.label
    }, "Your email"), /*#__PURE__*/React.createElement("input", {
      style: acStyles.input,
      value: email,
      onChange: e => setEmail(e.target.value),
      placeholder: "you@yours.com"
    }), /*#__PURE__*/React.createElement("label", {
      style: acStyles.label
    }, "Password"), /*#__PURE__*/React.createElement("input", {
      style: acStyles.input,
      value: pw,
      onChange: e => setPw(e.target.value),
      type: "password",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement("button", {
      style: acStyles.primary,
      onClick: () => setView('signed-in')
    }, "Sign in"), /*#__PURE__*/React.createElement("div", {
      style: acStyles.subtle
    }, "Don't have an account? ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        setView('signed-in');
      },
      style: {
        color: '#2F4A3A'
      }
    }, "Create one"))));
  }
  const saved = articles.filter(a => savedIds.has(a.id));
  return /*#__PURE__*/React.createElement("section", {
    style: acStyles.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: acStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: acStyles.head
  }, /*#__PURE__*/React.createElement("div", {
    style: acStyles.avatar
  }, "JS"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: acStyles.eyebrow
  }, "Account"), /*#__PURE__*/React.createElement("h1", {
    style: acStyles.h1
  }, "Hello, Jamie."), /*#__PURE__*/React.createElement("p", {
    style: acStyles.subtleInline
  }, "jamie@example.com \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setView('signin');
    }
  }, "Sign out")))), /*#__PURE__*/React.createElement("h2", {
    style: acStyles.h2
  }, "Saved articles ", saved.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: acStyles.count
  }, saved.length)), saved.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: acStyles.empty
  }, /*#__PURE__*/React.createElement(IconBookmark, {
    size: 24
  }), /*#__PURE__*/React.createElement("div", {
    style: acStyles.emptyTitle
  }, "Nothing saved yet"), /*#__PURE__*/React.createElement("div", {
    style: acStyles.emptyBody
  }, "Tap the heart on any article to keep it here for later.")) : /*#__PURE__*/React.createElement("div", {
    style: acStyles.list
  }, saved.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: acStyles.row,
    onClick: () => onOpen?.(a)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: acStyles.rowEyebrow
  }, a.topic), /*#__PURE__*/React.createElement("div", {
    style: acStyles.rowTitle
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: acStyles.rowMeta
  }, a.read, " min read \xB7 Reviewed by ", a.reviewer)), /*#__PURE__*/React.createElement(IconChevron, {
    size: 16
  }))))));
}
const acStyles = {
  wrap: {
    padding: '48px 32px 96px',
    background: 'var(--cream)'
  },
  inner: {
    maxWidth: 880,
    margin: '0 auto',
    fontFamily: 'Geist, sans-serif'
  },
  signinCard: {
    maxWidth: 440,
    margin: '32px auto',
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 16,
    padding: '36px 32px',
    boxShadow: '0 1px 2px rgba(27,31,28,0.04), 0 2px 8px rgba(27,31,28,0.04)',
    fontFamily: 'Geist, sans-serif'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 12
  },
  h1: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 40,
    letterSpacing: '-0.03em',
    color: '#1B1F1C',
    margin: 0,
    lineHeight: 1
  },
  h2: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 24,
    letterSpacing: '-0.02em',
    color: '#1B1F1C',
    margin: '32px 0 16px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 10
  },
  count: {
    background: '#DCE5DE',
    color: '#2F4A3A',
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 999,
    letterSpacing: 0,
    fontFamily: 'Geist, sans-serif'
  },
  lede: {
    fontSize: 15,
    color: '#4A524C',
    marginTop: 8,
    marginBottom: 24
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#4A524C',
    marginBottom: 6,
    marginTop: 16
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #E4DED1',
    background: '#F7F2E8',
    fontSize: 15,
    fontFamily: 'Geist, sans-serif',
    color: '#1B1F1C',
    boxSizing: 'border-box'
  },
  primary: {
    width: '100%',
    background: '#2F4A3A',
    color: '#F7F2E8',
    border: 'none',
    padding: '13px 16px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 24,
    fontFamily: 'Geist, sans-serif'
  },
  subtle: {
    marginTop: 16,
    fontSize: 13,
    color: '#7A8079',
    textAlign: 'center'
  },
  subtleInline: {
    fontSize: 13,
    color: '#7A8079',
    margin: '8px 0 0'
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background: '#2F4A3A',
    color: '#F7F2E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: 22,
    fontWeight: 500
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
    background: '#FBFAF5',
    border: '1px dashed #C9C3B5',
    borderRadius: 12,
    color: '#7A8079',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    color: '#1B1F1C',
    fontWeight: 500
  },
  emptyBody: {
    fontSize: 13
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 12,
    padding: '16px 20px',
    cursor: 'pointer',
    color: '#7A8079',
    boxShadow: '0 1px 2px rgba(27,31,28,0.04)'
  },
  rowEyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 4
  },
  rowTitle: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: 18,
    letterSpacing: '-0.02em',
    color: '#1B1F1C',
    marginBottom: 4
  },
  rowMeta: {
    fontSize: 12,
    color: '#7A8079'
  }
};
window.Account = Account;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Account.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ArticleCard.jsx
try { (() => {
const ARTICLES = [{
  id: 'a1',
  topic: 'Sleep',
  title: 'The quiet science of feeling rested',
  lede: "Eight hours is a slogan, not a prescription. Here's what your body is actually negotiating each night.",
  read: 4,
  reviewer: 'Dr. M. Tanaka'
}, {
  id: 'a2',
  topic: 'Heart',
  title: 'Why your resting heart rate matters',
  lede: 'A single number that quietly tracks decades of fitness, stress, and sleep.',
  read: 6,
  reviewer: 'Dr. A. Patel'
}, {
  id: 'a3',
  topic: 'Pain',
  title: "Why a sore throat in the morning isn't always a cold",
  lede: "You wake up, swallow, and there it is — the rasp. Before you stockpile lozenges, it's worth asking what your throat did overnight.",
  read: 5,
  reviewer: 'Dr. K. Reyes'
}, {
  id: 'a4',
  topic: 'Nutrition',
  title: "Eight glasses of water? It's complicated.",
  lede: 'The classic advice is older than the science. Here is what hydration actually depends on.',
  read: 7,
  reviewer: 'Dr. J. Okafor'
}, {
  id: 'a5',
  topic: 'Mind',
  title: 'When a low mood is a symptom, not a mood',
  lede: 'Sadness has its own grammar. So does depression. Knowing the difference matters.',
  read: 9,
  reviewer: 'Dr. L. Cho'
}, {
  id: 'a6',
  topic: 'Pain',
  title: 'When a headache is a migraine',
  lede: "Not all headaches are equal — and the right name leads to the right help.",
  read: 8,
  reviewer: 'Dr. K. Reyes'
}];
function ArticleCard({
  a,
  saved,
  onOpen,
  onToggleSave,
  variant = 'default'
}) {
  return /*#__PURE__*/React.createElement("article", {
    style: {
      ...acStyles.card,
      ...(variant === 'compact' ? acStyles.compact : {})
    },
    onClick: () => onOpen?.(a)
  }, saved && /*#__PURE__*/React.createElement("span", {
    style: acStyles.savedPill
  }, /*#__PURE__*/React.createElement(IconHeartFill, {
    size: 11,
    fill: "#A04330"
  }), " Saved"), /*#__PURE__*/React.createElement("div", {
    style: acStyles.eyebrow
  }, a.topic), /*#__PURE__*/React.createElement("h3", {
    style: acStyles.title
  }, a.title), /*#__PURE__*/React.createElement("p", {
    style: acStyles.lede
  }, a.lede), /*#__PURE__*/React.createElement("div", {
    style: acStyles.foot
  }, /*#__PURE__*/React.createElement("span", null, a.read, " min read"), /*#__PURE__*/React.createElement("span", {
    style: acStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Reviewed by ", a.reviewer), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onToggleSave?.(a);
    },
    style: acStyles.saveBtn,
    "aria-label": saved ? 'Unsave' : 'Save'
  }, saved ? /*#__PURE__*/React.createElement(IconHeartFill, {
    size: 16,
    fill: "#A04330"
  }) : /*#__PURE__*/React.createElement(IconHeart, {
    size: 16
  }))));
}
const acStyles = {
  card: {
    position: 'relative',
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 12,
    padding: '22px 24px',
    boxShadow: '0 1px 2px rgba(27,31,28,0.04), 0 2px 8px rgba(27,31,28,0.04)',
    fontFamily: 'Geist, sans-serif',
    cursor: 'pointer',
    transition: 'transform 150ms cubic-bezier(.2,.6,.2,1), box-shadow 150ms',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  compact: {
    padding: '16px 18px'
  },
  savedPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    background: '#F5DCD3',
    color: '#A04330',
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6E8A78'
  },
  title: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 22,
    lineHeight: 1.15,
    letterSpacing: '-0.025em',
    color: '#1B1F1C',
    margin: 0
  },
  lede: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#4A524C',
    margin: 0
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#7A8079',
    marginTop: 6
  },
  dot: {
    color: '#C9C3B5'
  },
  saveBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: '#7A8079',
    cursor: 'pointer',
    padding: 4,
    display: 'inline-flex',
    alignItems: 'center'
  }
};
window.ArticleCard = ArticleCard;
window.HEALCIA_ARTICLES = ARTICLES;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ArticleCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ArticleView.jsx
try { (() => {
function ArticleView({
  a,
  saved,
  onBack,
  onToggleSave
}) {
  return /*#__PURE__*/React.createElement("article", {
    style: avStyles.wrap
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: avStyles.back
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      transform: 'rotate(180deg)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(IconChevron, {
    size: 14
  })), "Back to all articles"), /*#__PURE__*/React.createElement("div", {
    style: avStyles.eyebrow
  }, a.topic, " \xB7 Reviewed by clinicians"), /*#__PURE__*/React.createElement("h1", {
    style: avStyles.h1
  }, a.title), /*#__PURE__*/React.createElement("p", {
    style: avStyles.lede
  }, a.lede), /*#__PURE__*/React.createElement("div", {
    style: avStyles.meta
  }, /*#__PURE__*/React.createElement("div", {
    style: avStyles.metaLeft
  }, /*#__PURE__*/React.createElement("span", null, a.read, " min read"), /*#__PURE__*/React.createElement("span", {
    style: avStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Updated June 2025"), /*#__PURE__*/React.createElement("span", {
    style: avStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Reviewed by ", a.reviewer)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onToggleSave?.(a),
    style: avStyles.saveBtn
  }, saved ? /*#__PURE__*/React.createElement(IconHeartFill, {
    size: 16,
    fill: "#A04330"
  }) : /*#__PURE__*/React.createElement(IconHeart, {
    size: 16
  }), saved ? 'Saved' : 'Save')), /*#__PURE__*/React.createElement("hr", {
    style: avStyles.rule
  }), /*#__PURE__*/React.createElement("p", null, "Most mornings, the throat catches first. You swallow, wince, and reach for your phone. It's tempting to call it a cold and move on, but the morning rasp has at least three plausible explanations \u2014 and only one of them needs treatment urgently."), /*#__PURE__*/React.createElement("h2", {
    style: avStyles.h2
  }, "What your throat did overnight"), /*#__PURE__*/React.createElement("p", null, "The simplest culprit is air. We breathe roughly 23,000 times a day; in sleep, many of us shift from nose to mouth as the night goes on. Mouth-breathing dries out the soft palate and pharynx, and a dry throat \u2014 like a dry eye \u2014 feels sore until it's rehydrated."), /*#__PURE__*/React.createElement("div", {
    style: avStyles.callout
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, "Worth knowing."), " Most morning sore throats trace back to overnight breathing \u2014 not a virus. If a glass of water clears it within 20 minutes, breathing is your answer."), /*#__PURE__*/React.createElement("p", null, "If the rasp persists past lunch, ask what else was at play overnight. Acid reflux can climb during sleep, and the pharynx pays the price. Allergies \u2014 particularly to dust mites in bedding \u2014 can produce a postnasal drip that you only notice when you stand up."), /*#__PURE__*/React.createElement("blockquote", {
    style: avStyles.pull
  }, "\"If your patient can tell you what's wrong, they usually have. Listen first, test second.\"", /*#__PURE__*/React.createElement("span", {
    style: avStyles.pullSrc
  }, "\u2014 Dr. M. Tanaka, Healcia medical board")), /*#__PURE__*/React.createElement("h2", {
    style: avStyles.h2
  }, "When to take it seriously"), /*#__PURE__*/React.createElement("p", null, "A few patterns warrant a call to your clinician within a day or two: a sore throat that lasts more than a week, comes with a fever above 38.5\xB0C, or pairs with difficulty swallowing or breathing."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...avStyles.callout,
      ...avStyles.calloutDanger
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, "Get help now"), " if you have trouble breathing, can't swallow your own saliva, or notice a swollen tongue. Call your local emergency number."));
}
const avStyles = {
  wrap: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '48px 32px 96px',
    fontFamily: 'Geist, sans-serif'
  },
  back: {
    background: 'transparent',
    border: 'none',
    color: '#4A524C',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    marginBottom: 32,
    fontFamily: 'Geist, sans-serif'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 16
  },
  h1: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    color: '#1B1F1C',
    margin: 0
  },
  lede: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 24,
    lineHeight: 1.3,
    color: '#4A524C',
    marginTop: 20
  },
  meta: {
    marginTop: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: '#7A8079',
    flexWrap: 'wrap'
  },
  metaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0
  },
  dot: {
    color: '#C9C3B5'
  },
  saveBtn: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13,
    color: '#1B1F1C',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  },
  rule: {
    border: 0,
    borderTop: '1px solid #E4DED1',
    margin: '32px 0'
  },
  h2: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 32,
    letterSpacing: '-0.025em',
    color: '#1B1F1C',
    marginTop: 40,
    marginBottom: 12
  },
  callout: {
    background: '#DCE5DE',
    color: '#213429',
    borderLeft: '3px solid #2F4A3A',
    padding: '14px 18px',
    borderRadius: 8,
    fontSize: 15,
    lineHeight: 1.55,
    margin: '20px 0'
  },
  calloutDanger: {
    background: '#F2D5CB',
    color: '#8E3D2D',
    borderLeftColor: '#A04330'
  },
  pull: {
    margin: '40px 0',
    padding: 0,
    borderLeft: 'none',
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 28,
    lineHeight: 1.25,
    color: '#1B1F1C',
    letterSpacing: '-0.01em',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  pullSrc: {
    fontFamily: 'Geist, sans-serif',
    fontStyle: 'normal',
    fontSize: 13,
    color: '#7A8079'
  }
};
window.ArticleView = ArticleView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ArticleView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Footer.jsx
try { (() => {
function Footer() {
  const cols = [{
    title: 'Read',
    links: ['Sleep', 'Heart health', 'Pain', 'Mind', 'Nutrition', 'Hydration']
  }, {
    title: 'Tools',
    links: ['Symptom checker', 'Medication library', 'Find a clinician']
  }, {
    title: 'About',
    links: ['Our medical board', 'Editorial standards', 'How we work']
  }, {
    title: 'Quiet bits',
    links: ['Privacy', 'Terms', 'Contact us']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: ftStyles.foot
  }, /*#__PURE__*/React.createElement("div", {
    style: ftStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: ftStyles.left
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/healcia-glyph.svg",
    width: "32",
    height: "32",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    style: ftStyles.word
  }, "Healcia"), /*#__PURE__*/React.createElement("div", {
    style: ftStyles.tag
  }, "Health, understood.")), /*#__PURE__*/React.createElement("div", {
    style: ftStyles.cols
  }, cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title
  }, /*#__PURE__*/React.createElement("div", {
    style: ftStyles.colTitle
  }, c.title), /*#__PURE__*/React.createElement("ul", {
    style: ftStyles.list
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: ftStyles.link
  }, l)))))))), /*#__PURE__*/React.createElement("div", {
    style: ftStyles.bottom
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Healcia"), /*#__PURE__*/React.createElement("span", null, "Healcia provides information, not medical advice. Always consult a clinician.")));
}
const ftStyles = {
  foot: {
    background: 'var(--cream-deep)',
    borderTop: '1px solid #E4DED1',
    padding: '56px 32px 28px',
    fontFamily: 'Geist, sans-serif'
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 64
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  word: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 32,
    color: '#2F4A3A',
    letterSpacing: '-0.02em',
    marginTop: 8
  },
  tag: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#4A524C'
  },
  cols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 32
  },
  colTitle: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#1B1F1C',
    marginBottom: 14
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  link: {
    color: '#4A524C',
    textDecoration: 'none',
    fontSize: 14
  },
  bottom: {
    maxWidth: 1200,
    margin: '40px auto 0',
    paddingTop: 20,
    borderTop: '1px solid #E4DED1',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    fontSize: 12,
    color: '#7A8079',
    flexWrap: 'wrap'
  }
};
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Header.jsx
try { (() => {
function Header({
  active = 'home',
  onNav,
  onSearch,
  savedCount = 0
}) {
  const links = [['home', 'Home'], ['read', 'Read'], ['check', 'Symptom checker'], ['account', 'Account']];
  return /*#__PURE__*/React.createElement("header", {
    style: hdrStyles.bar
  }, /*#__PURE__*/React.createElement("div", {
    style: hdrStyles.inner
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav?.('home');
    },
    style: hdrStyles.brand
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/healcia-glyph.svg",
    width: "28",
    height: "28",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: hdrStyles.word
  }, "Healcia")), /*#__PURE__*/React.createElement("nav", {
    style: hdrStyles.nav
  }, links.map(([k, label]) => /*#__PURE__*/React.createElement("a", {
    key: k,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav?.(k);
    },
    style: {
      ...hdrStyles.link,
      ...(active === k ? hdrStyles.linkActive : {})
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: hdrStyles.right
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onSearch,
    style: hdrStyles.iconBtn,
    "aria-label": "Search"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav?.('account'),
    style: hdrStyles.signin
  }, "Sign in"))));
}
const hdrStyles = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(247,242,232,0.85)',
    backdropFilter: 'blur(12px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
    borderBottom: '1px solid #E4DED1'
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 32
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    color: '#2F4A3A'
  },
  word: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: '-0.02em'
  },
  nav: {
    display: 'flex',
    gap: 26,
    flex: 1
  },
  link: {
    color: '#4A524C',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 0',
    borderBottom: '2px solid transparent',
    transition: 'color 150ms cubic-bezier(.2,.6,.2,1)'
  },
  linkActive: {
    color: '#2F4A3A',
    borderBottomColor: '#2F4A3A'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4A524C',
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signin: {
    background: '#2F4A3A',
    color: '#F7F2E8',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  }
};
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Hero.jsx
try { (() => {
function Hero({
  onCTA
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: heroStyles.section
  }, /*#__PURE__*/React.createElement("div", {
    style: heroStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: heroStyles.eyebrow
  }, "The Healcia field guide"), /*#__PURE__*/React.createElement("h1", {
    style: heroStyles.headline
  }, "Health,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
    style: heroStyles.italic
  }, "understood.")), /*#__PURE__*/React.createElement("p", {
    style: heroStyles.lede
  }, "Clear, evidence-based answers to the questions you'd ask a doctor friend \u2014 written by clinicians, edited for humans."), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.ctas
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onCTA?.('read'),
    style: heroStyles.primary
  }, "Start reading ", /*#__PURE__*/React.createElement(IconArrowRight, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => onCTA?.('check'),
    style: heroStyles.secondary
  }, "Check a symptom")), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.trust
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: '#4A7359'
    }
  }, /*#__PURE__*/React.createElement(IconShield, {
    size: 14
  }), " Reviewed by clinicians"), /*#__PURE__*/React.createElement("span", {
    style: heroStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Updated weekly"), /*#__PURE__*/React.createElement("span", {
    style: heroStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "No ads, no SEO clickbait"))));
}
const heroStyles = {
  section: {
    padding: '80px 32px 64px',
    background: 'var(--cream)'
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 20
  },
  headline: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 'clamp(56px, 9vw, 120px)',
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
    color: '#1B1F1C',
    margin: 0
  },
  italic: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    color: '#2F4A3A',
    fontWeight: 400,
    letterSpacing: '-0.02em'
  },
  lede: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 24,
    lineHeight: 1.3,
    color: '#4A524C',
    maxWidth: 560,
    marginTop: 28,
    marginBottom: 36
  },
  ctas: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#2F4A3A',
    color: '#F7F2E8',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  },
  secondary: {
    background: 'transparent',
    color: '#1B1F1C',
    border: '1px solid #C9C3B5',
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Geist, sans-serif'
  },
  trust: {
    marginTop: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: '#7A8079',
    flexWrap: 'wrap'
  },
  dot: {
    color: '#C9C3B5'
  }
};
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SymptomChecker.jsx
try { (() => {
function SymptomChecker() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const STEPS = [{
    id: 'what',
    q: "What's bothering you most right now?",
    options: ['Headache', 'Sore throat', 'Stomach pain', 'Fatigue', 'Trouble sleeping', 'Something else']
  }, {
    id: 'when',
    q: 'When did it start?',
    options: ['Today', 'Yesterday', 'A few days ago', 'A week or more']
  }, {
    id: 'how',
    q: 'How would you describe it?',
    options: ['Mild — annoying but functional', 'Moderate — distracting', 'Severe — hard to ignore']
  }];
  const isResult = step >= STEPS.length;
  const cur = STEPS[step];
  const pick = opt => {
    setAnswers({
      ...answers,
      [cur.id]: opt
    });
    setTimeout(() => setStep(step + 1), 220);
  };
  const reset = () => {
    setStep(0);
    setAnswers({});
  };
  return /*#__PURE__*/React.createElement("section", {
    style: scStyles.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: scStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: scStyles.head
  }, /*#__PURE__*/React.createElement("div", {
    style: scStyles.eyebrow
  }, "Symptom checker"), /*#__PURE__*/React.createElement("h1", {
    style: scStyles.h1
  }, "Let's start with one question at a time."), /*#__PURE__*/React.createElement("p", {
    style: scStyles.lede
  }, "Healcia's checker is for information, not diagnosis. We'll point you toward what to read \u2014 and when to call a clinician.")), !isResult && /*#__PURE__*/React.createElement("div", {
    style: scStyles.card
  }, /*#__PURE__*/React.createElement("div", {
    style: scStyles.progress
  }, /*#__PURE__*/React.createElement("span", {
    style: scStyles.progressLabel
  }, "Step ", step + 1, " of ", STEPS.length), /*#__PURE__*/React.createElement("div", {
    style: scStyles.bar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...scStyles.barFill,
      width: `${step / STEPS.length * 100}%`
    }
  }))), /*#__PURE__*/React.createElement("h2", {
    style: scStyles.q
  }, cur.q), /*#__PURE__*/React.createElement("div", {
    style: scStyles.options
  }, cur.options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => pick(o),
    style: {
      ...scStyles.opt,
      ...(answers[cur.id] === o ? scStyles.optActive : {})
    }
  }, /*#__PURE__*/React.createElement("span", null, o), /*#__PURE__*/React.createElement(IconChevron, {
    size: 16
  })))), step > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setStep(step - 1),
    style: scStyles.back
  }, "\u2190 Back")), isResult && /*#__PURE__*/React.createElement("div", {
    style: scStyles.card
  }, /*#__PURE__*/React.createElement("div", {
    style: scStyles.resultIcon
  }, /*#__PURE__*/React.createElement(IconLeaf, {
    size: 28
  })), /*#__PURE__*/React.createElement("h2", {
    style: scStyles.q
  }, "Here's what we'd suggest reading."), /*#__PURE__*/React.createElement("p", {
    style: scStyles.summary
  }, "Based on your answers \u2014 ", /*#__PURE__*/React.createElement("em", null, answers.what?.toLowerCase()), ", started ", /*#__PURE__*/React.createElement("em", null, answers.when?.toLowerCase()), ", feels ", /*#__PURE__*/React.createElement("em", null, answers.how?.split(' ')[0].toLowerCase()), " \u2014 three articles are worth your time tonight."), /*#__PURE__*/React.createElement("div", {
    style: scStyles.results
  }, (window.HEALCIA_ARTICLES || []).slice(0, 3).map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: scStyles.resultRow
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: scStyles.resultTitle
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: scStyles.resultMeta
  }, a.read, " min read \xB7 ", a.topic)), /*#__PURE__*/React.createElement(IconChevron, {
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    style: scStyles.calloutWarn
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, "If symptoms are severe, sudden, or getting worse,"), " call your clinician or a local emergency line. This checker doesn't diagnose."), /*#__PURE__*/React.createElement("button", {
    onClick: reset,
    style: scStyles.restart
  }, "Start over"))));
}
const scStyles = {
  wrap: {
    padding: '64px 32px 96px',
    background: 'var(--cream)'
  },
  inner: {
    maxWidth: 720,
    margin: '0 auto',
    fontFamily: 'Geist, sans-serif'
  },
  head: {
    marginBottom: 40
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6E8A78',
    marginBottom: 16
  },
  h1: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 44,
    letterSpacing: '-0.03em',
    color: '#1B1F1C',
    margin: 0,
    lineHeight: 1.05
  },
  lede: {
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontStyle: 'italic',
    fontSize: 21,
    lineHeight: 1.3,
    color: '#4A524C',
    marginTop: 16,
    marginBottom: 0
  },
  card: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 16,
    padding: '32px 32px 24px',
    boxShadow: '0 1px 2px rgba(27,31,28,0.04), 0 2px 8px rgba(27,31,28,0.04)'
  },
  progress: {
    marginBottom: 28
  },
  progressLabel: {
    fontSize: 12,
    color: '#7A8079',
    letterSpacing: '0.04em'
  },
  bar: {
    marginTop: 8,
    height: 3,
    background: '#E4DED1',
    borderRadius: 999,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    background: '#2F4A3A',
    transition: 'width 360ms cubic-bezier(.2,.6,.2,1)'
  },
  q: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 28,
    letterSpacing: '-0.02em',
    color: '#1B1F1C',
    margin: '0 0 20px'
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  opt: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F7F2E8',
    border: '1px solid #E4DED1',
    borderRadius: 10,
    padding: '14px 18px',
    fontSize: 15,
    color: '#1B1F1C',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Geist, sans-serif',
    transition: 'background 150ms cubic-bezier(.2,.6,.2,1), border-color 150ms'
  },
  optActive: {
    background: '#DCE5DE',
    borderColor: '#2F4A3A'
  },
  back: {
    marginTop: 16,
    background: 'transparent',
    border: 'none',
    color: '#4A524C',
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'Geist, sans-serif'
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: '#DCE5DE',
    color: '#2F4A3A',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  summary: {
    fontSize: 16,
    color: '#4A524C',
    lineHeight: 1.5,
    marginBottom: 20
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F7F2E8',
    border: '1px solid #E4DED1',
    borderRadius: 10,
    padding: '14px 18px',
    cursor: 'pointer',
    color: '#1B1F1C'
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 2
  },
  resultMeta: {
    fontSize: 12,
    color: '#7A8079'
  },
  calloutWarn: {
    background: '#F2E4CC',
    color: '#6E4A1A',
    borderLeft: '3px solid #B5803A',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 20
  },
  restart: {
    background: 'transparent',
    border: '1px solid #C9C3B5',
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#1B1F1C',
    fontFamily: 'Geist, sans-serif'
  }
};
window.SymptomChecker = SymptomChecker;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SymptomChecker.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/TopicGrid.jsx
try { (() => {
const TOPICS = [{
  id: 'sleep',
  label: 'Sleep',
  icon: 'moon',
  count: 38
}, {
  id: 'heart',
  label: 'Heart health',
  icon: 'activity',
  count: 52
}, {
  id: 'pain',
  label: 'Pain',
  icon: 'pill',
  count: 41
}, {
  id: 'mind',
  label: 'Mental health',
  icon: 'brain',
  count: 67
}, {
  id: 'nutr',
  label: 'Nutrition',
  icon: 'leaf',
  count: 73
}, {
  id: 'hydr',
  label: 'Hydration',
  icon: 'droplet',
  count: 19
}];
function TopicGrid({
  onPick
}) {
  const iconFor = k => ({
    moon: IconMoon,
    activity: IconActivity,
    pill: IconPill,
    brain: IconBrain,
    leaf: IconLeaf,
    droplet: IconDroplet
  })[k];
  return /*#__PURE__*/React.createElement("section", {
    style: tgStyles.section
  }, /*#__PURE__*/React.createElement("div", {
    style: tgStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: tgStyles.head
  }, /*#__PURE__*/React.createElement("h2", {
    style: tgStyles.h2
  }, "Browse by topic"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: tgStyles.see,
    onClick: e => e.preventDefault()
  }, "See all topics ", /*#__PURE__*/React.createElement(IconArrowRight, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: tgStyles.grid
  }, TOPICS.map(t => {
    const Ic = iconFor(t.icon);
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onPick?.(t),
      style: tgStyles.card
    }, /*#__PURE__*/React.createElement("div", {
      style: tgStyles.iconWrap
    }, /*#__PURE__*/React.createElement(Ic, {
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      style: tgStyles.label
    }, t.label), /*#__PURE__*/React.createElement("div", {
      style: tgStyles.count
    }, t.count, " articles"));
  }))));
}
const tgStyles = {
  section: {
    padding: '64px 32px',
    background: 'var(--cream-deep)'
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto'
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 32
  },
  h2: {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontVariationSettings: '"opsz" 96, "wght" 500',
    fontSize: 40,
    letterSpacing: '-0.025em',
    color: '#1B1F1C',
    margin: 0
  },
  see: {
    color: '#2F4A3A',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    gap: 6,
    alignItems: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12
  },
  card: {
    background: '#FBFAF5',
    border: '1px solid #E4DED1',
    borderRadius: 12,
    padding: '22px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'background 150ms cubic-bezier(.2,.6,.2,1), transform 150ms',
    fontFamily: 'Geist, sans-serif'
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#DCE5DE',
    color: '#2F4A3A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1B1F1C'
  },
  count: {
    fontSize: 12,
    color: '#7A8079'
  }
};
window.TopicGrid = TopicGrid;
window.HEALCIA_TOPICS = TOPICS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/TopicGrid.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/icons.jsx
try { (() => {
// Lucide-style 1.75px stroke icons, inline. currentColor for inheritance.
const Icon = ({
  d,
  size = 20,
  children,
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style
}, d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.5-9.5-9.4C.7 8.1 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.3 4.1 4.5 7.6C19 16.5 12 21 12 21z"
}));
const IconHeartFill = p => /*#__PURE__*/React.createElement("svg", {
  width: p.size || 20,
  height: p.size || 20,
  viewBox: "0 0 24 24",
  fill: p.fill || 'currentColor'
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.5-9.5-9.4C.7 8.1 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.3 4.1 4.5 7.6C19 16.5 12 21 12 21z"
}));
const IconActivity = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M22 12h-4l-3 9L9 3l-3 9H2"
}));
const IconSearch = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "m20 20-3.5-3.5"
}));
const IconBookmark = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
}));
const IconPill = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l10 10a5 5 0 0 1-7 7Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m8.5 8.5 7 7"
}));
const IconClock = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7v5l3 2"
}));
const IconUser = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "8",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
}));
const IconMenu = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 6h18M3 12h18M3 18h18"
}));
const IconChevron = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
const IconArrowRight = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14M13 5l7 7-7 7"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l5 5L20 7"
}));
const IconClose = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6 6 18"
}));
const IconHome = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12 12 4l9 8M5 10v10h14V10"
}));
const IconBook = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 19V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 7h7M8 11h7M8 15h4"
}));
const IconMessage = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12a8 8 0 0 1-12.9 6.3L3 20l1.7-5.1A8 8 0 1 1 21 12z"
}));
const IconBrain = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8V13a3 3 0 0 0 2 2.8V17a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8V13a3 3 0 0 1-2 2.8V17a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V4z"
}));
const IconLeaf = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4 19 2c1 2 2 4 2 8a7 7 0 0 1-7 7z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 22 17 7"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5z"
}));
const IconDroplet = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 22a7 7 0 0 0 7-7c0-5-7-13-7-13S5 10 5 15a7 7 0 0 0 7 7z"
}));
const IconMoon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
}));
Object.assign(window, {
  Icon,
  IconHeart,
  IconHeartFill,
  IconActivity,
  IconSearch,
  IconBookmark,
  IconPill,
  IconClock,
  IconUser,
  IconMenu,
  IconChevron,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconHome,
  IconBook,
  IconMessage,
  IconBrain,
  IconLeaf,
  IconShield,
  IconDroplet,
  IconMoon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/icons.jsx", error: String((e && e.message) || e) }); }

})();
