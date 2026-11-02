import Link from "next/link";

const ayat = [
  {
    ref: "2:2",
    marker: "﴿٢﴾",
    arabic: "ذٰلِكَ الۡڪِتٰبُ لَا رَيۡبَ ۛۚ ۖ فِيۡهِ ۛۚ هُدًى لِّلۡمُتَّقِيۡنَۙ",
    translation: "This is the Book of Allah, there is no doubt in it; it is a guidance for the pious,",
  },
  {
    ref: "2:3",
    marker: "﴿٣﴾",
    arabic: "الَّذِيۡنَ يُؤۡمِنُوۡنَ بِالۡغَيۡبِ وَ يُقِيۡمُوۡنَ الصَّلٰوةَ وَمِمَّا رَزَقۡنٰهُمۡ يُنۡفِقُوۡنَۙ",
    translation:
      "for those who believe in the existence of that which is beyond the reach of perception, who establish Prayer and spend out of what We have provided them,",
  },
  {
    ref: "2:4",
    marker: "﴿٤﴾",
    arabic: "وَالَّذِيۡنَ يُؤۡمِنُوۡنَ بِمَۤا اُنۡزِلَ اِلَيۡكَ وَمَاۤ اُنۡزِلَ مِنۡ قَبۡلِكَۚ وَبِالۡاٰخِرَةِ هُمۡ يُوۡقِنُوۡنَؕ",
    translation:
      "who believe in what has been revealed to you and what was revealed before you, and have firm faith in the Hereafter.",
  },
  {
    ref: "2:5",
    marker: "﴿٥﴾",
    arabic: "اُولٰٓـئِكَ عَلٰى هُدًى مِّنۡ رَّبِّهِمۡ وَاُولٰٓـئِكَ هُمُ الۡمُفۡلِحُوۡنَ",
    translation: "Such are on true guidance from their Lord; such are the truly successful.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="hero">
        <p className="ar-name" lang="ar">بيت العلم</p>
        <h1>Bait al-Elmi</h1>
        <p className="sub">Learning Centre</p>
      </div>

      <section className="passage" aria-labelledby="passage-title">
        <div className="wrap">
          <div className="passage-head">
            <h2 id="passage-title">Surah Al-Baqarah</h2>
            <p>Surah 2, Ayat 2–5</p>
          </div>

          {ayat.map((a) => (
            <div className="ayah" key={a.ref}>
              <p className="arabic" lang="ar">
                {a.arabic} <span className="marker">{a.marker}</span>
              </p>
              <p className="translation">
                <span className="ref">{a.ref}</span>
                {a.translation}
              </p>
            </div>
          ))}

          <div className="cta-row">
            <Link className="btn primary" href="/about#classes">See our classes</Link>
            <Link className="btn" href="/about">About the centre</Link>
          </div>
        </div>
      </section>
    </>
  );
}
