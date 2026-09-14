"""Deterministic multilingual explanation templates for English, Hindi, and Gujarati.

Provides reliable, offline-ready vernacular explanations without any external API dependency.
"""

from typing import Any, Dict, List, Optional

EXPLANATION_TEMPLATES = {
    "en": {
        "RECOMMEND": {
            "summary": "Your financial trajectory shows healthy savings and consistent income.",
            "details": "You have maintained an average savings buffer of {savings_pct}% and manageable debt obligations. We recommend options to optimize your surplus savings.",
            "action": "Next step: Explore our high-yield deposit or auto-sweep options.",
        },
        "INTERVENE": {
            "summary": "We noticed an increase in monthly outflows relative to your income buffer.",
            "details": "Your current debt obligations and living expenses account for a significant portion of your income, reducing your savings rate to {savings_pct}%. Proactive support is available to ease monthly cash flow.",
            "action": "Next step: Review flexible tenure extension or personalized budgeting guidance.",
        },
        "VERIFY": {
            "summary": "An unusual transaction pattern was observed on your account.",
            "details": "We identified debit activity that deviates from your normal spending profile. We request your verification to ensure account security and accuracy.",
            "action": "Next step: Please review and confirm your recent account activity.",
        },
        "NO_ACTION": {
            "summary": "No immediate financial intervention or recommendation is needed.",
            "details": "Your account records are stable or in early observation with no specific advisory action required at this moment.",
            "action": "Next step: Continue your regular banking activities.",
        },
    },
    "hi": {
        "RECOMMEND": {
            "summary": "आपकी वित्तीय स्थिति स्थिर और बचत अनुकूल दिख रही है।",
            "details": "आपकी मासिक बचत दर लगभग {savings_pct}% है और आपकी आय स्थिर बनी हुई है। हम आपकी अतिरिक्त बचत पर बेहतर लाभ प्राप्त करने के विकल्पों की सिफारिश करते हैं।",
            "action": "अगला कदम: उच्च ब्याज वाले डिपॉजिट या ऑटो-स्वीप विकल्प देखें।",
        },
        "INTERVENE": {
            "summary": "आपकी मासिक आय की तुलना में खर्चों और ईएमआई में बढ़ोतरी देखी गई है।",
            "details": "वर्तमान ईएमआई और खर्चों के कारण आपकी बचत दर घटकर {savings_pct}% हो गई है। आपके मासिक नकदी प्रवाह को आसान बनाने के लिए सहायता उपलब्ध है।",
            "action": "अगला कदम: ईएमआई पुनर्गठन या बजट सहायता विकल्पों की समीक्षा करें।",
        },
        "VERIFY": {
            "summary": "आपके खाते में सामान्य से अलग लेनदेन देखा गया है।",
            "details": "हमने ऐसा लेनदेन दर्ज किया है जो आपके नियमित खर्च के तरीके से भिन्न है। खाते की सुरक्षा और पुष्टि के लिए आपका सत्यापन आवश्यक है।",
            "action": "अगला कदम: कृपया अपने हालिया लेनदेन की पुष्टि करें।",
        },
        "NO_ACTION": {
            "summary": "इस समय किसी विशेष वित्तीय कार्रवाई या सिफारिश की आवश्यकता नहीं है।",
            "details": "आपका खाता स्थिर है और इस समय किसी अतिरिक्त सुझाव की आवश्यकता नहीं है।",
            "action": "अगला कदम: अपना सामान्य बैंकिंग कार्य जारी रखें।",
        },
    },
    "gu": {
        "RECOMMEND": {
            "summary": "તમારી નાણાકીય સ્થિતિ સ્વસ્થ અને બચત અનુકૂળ જણાય છે.",
            "details": "તમે લગભગ {savings_pct}% જેટલો બચત દર જાળવી રાખ્યો છે અને તમારી આવક સ્થિર છે. અમે તમારી વધારાની બચત પર વધુ વળતર મેળવવા માટેના વિકલ્પોની ભલામણ કરીએ છીએ.",
            "action": "આગળનું પગલું: ઉચ્ચ વ્યાજ ધરાવતા ડિપોઝિટ અથવા ઓટો-સ્વીપ વિકલ્પો તપાસો.",
        },
        "INTERVENE": {
            "summary": "તમારી આવકની સરખામણીમાં માસિક ખર્ચ અને EMI માં વધારો જોવા મળ્યો છે.",
            "details": "હાલના ખર્ચાઓ અને લોનની જવાબદારીઓને કારણે તમારો બચત દર ઘટીને {savings_pct}% થયો છે. માસિક બોજ હળવો કરવા માટે સહાયતા ઉપલબ્ધ છે.",
            "action": "આગળનું પગલું: લોનની મુદત લંબાવવા અથવા બજેટ આયોજનના વિકલ્પો જુઓ.",
        },
        "VERIFY": {
            "summary": "તમારા ખાતામાં સામાન્ય કરતાં અલગ વ્યવહાર જોવા મળ્યો છે.",
            "details": "અમે તમારા નિયમિત ખર્ચના પેટર્નથી અલગ એવો વ્યવહાર નોંધ્યો છે. ખાતાની સુરક્ષા ખાતરી કરવા માટે તમારી પુષ્ટિ જરૂરી છે.",
            "action": "આગળનું પગલું: કૃપા કરીને તમારા તાજેતરના વ્યવહારની ચકાસણી કરો.",
        },
        "NO_ACTION": {
            "summary": "આ સમયે કોઈ તાત્કાલિક નાણાકીય ભલામણ કે હસ્તક્ષેપની જરૂર નથી.",
            "details": "તમારું ખાતું સ્થિર છે અને હાલમાં કોઈ ખાસ સલાહ કે ફેરફારની જરૂર નથી.",
            "action": "આગળનું પગલું: તમારી સામાન્ય બેંકિંગ પ્રવૃત્તિ ચાલુ રાખો.",
        },
    },
}


def render_template_explanation(
    decision: str,
    language: str,
    signals: Optional[Dict[str, Any]] = None,
    action: Optional[Dict[str, Any]] = None,
) -> Dict[str, str]:
    """
    Renders a deterministic vernacular explanation.
    Guarantees no hallucinations, no policy overrides, and no network latency.
    """
    lang = language.lower() if language else "en"
    if lang not in EXPLANATION_TEMPLATES:
        lang = "en"

    state_templates = EXPLANATION_TEMPLATES[lang].get(
        decision, EXPLANATION_TEMPLATES["en"]["NO_ACTION"]
    )

    savings_rate = (signals or {}).get("savings_rate")
    savings_pct = int(round(savings_rate * 100)) if savings_rate is not None else 0

    summary = state_templates["summary"]
    details = state_templates["details"].format(savings_pct=savings_pct)
    action_text = (
        action.get("title") + ": " + action.get("description")
        if action and action.get("title")
        else state_templates["action"]
    )

    full_text = f"{summary} {details} {action_text}"

    return {
        "language": lang,
        "summary": summary,
        "details": details,
        "action_text": action_text,
        "full_explanation": full_text,
    }
