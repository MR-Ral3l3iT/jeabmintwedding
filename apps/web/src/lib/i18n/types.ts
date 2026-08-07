export type InviteLocale = 'TH' | 'EN';

export type InviteMessages = {
  hero: {
    cordiallyInvite: string;
    welcome: string;
    openEnvelope: string;
    tapToOpen: string;
    weddingOf: string;
    weddingDate: string;
    scrollDown: string;
    toCeremony: string;
  };
  quote: {
    line1: string;
    line2: string;
    cite: string;
  };
  countdown: {
    eyebrow: string;
    title: string;
    date: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  venue: {
    eyebrow: string;
    title: string;
    directions: string;
    venueName: string;
    city: string;
    timeline: Record<string, string>;
  };
  dress: {
    eyebrow: string;
    title: string;
    subtitle: string;
    withPleasure: string;
    body: string;
  };
  manual: {
    eyebrow: string;
    title: string;
    items: Array<{
      icon: 'clock' | 'shirt' | 'smartphone' | 'gift';
      title: string;
      desc: string;
      showPalette?: boolean;
      hashtag?: string;
    }>;
  };
  rsvp: {
    titleConfirm: string;
    titleThanks: string;
    deadlinePrefix: string;
    cta: string;
    confirmedAttending: string;
    confirmedDeclined: string;
    contactHint: string;
    lineContactNote: string;
  };
  rsvpStep1: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    nameRequired: string;
    attend: string;
    decline: string;
    helpPrepare: string;
    thankYou: string;
  };
  rsvpAttending: {
    delighted: string;
    thanksPrefix: string;
    willJoin: string;
    countLabel: string;
    countHint: string;
    countError: string;
    confirm: string;
    saving: string;
    thankYouTitle: string;
    gladPrefix: string;
    willJoinCount: string;
    lineContactNote: string;
  };
  rsvpDeclined: {
    title: string;
    intro: string;
    sentTitle: string;
    sentBody: string;
    close: string;
    tabWish: string;
    tabPay: string;
    wishLabel: string;
    wishPlaceholder: string;
    sending: string;
    sendWish: string;
    transferBank: string;
    transferPromptpay: string;
    noQr: string;
    accountName: string;
    copied: string;
    copyAccount: string;
    copyPhone: string;
    payNote: string;
    done: string;
  };
  rsvpModal: {
    aria: string;
    close: string;
    alreadyTitle: string;
    alreadyAttending: string;
    alreadyDeclined: string;
  };
  join: {
    loading: string;
    notFoundTitle: string;
    savedTitle: string;
    welcome: string;
    sideGroom: string;
    sideBride: string;
    groomNickname: string;
    brideNickname: string;
    nextLine: string;
    addLine: string;
    addLineDesc: string;
    orScanLine: string;
    formTitle: string;
    formIntro: string;
    forGuest: string;
    nicknameLabel: string;
    nicknamePlaceholder: string;
    sideLegend: string;
    sideGroomBtn: string;
    sideBrideBtn: string;
    nicknameRequired: string;
    sideRequired: string;
    submit: string;
    saving: string;
  };
  joinCta: {
    title: string;
    body: string;
    open: string;
    copied: string;
    copy: string;
  };
  lineHint: {
    intro: string;
    copied: string;
    copy: string;
  };
};

export function formatWeddingDate(locale: InviteLocale, date: Date): string {
  if (locale === 'EN') {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
