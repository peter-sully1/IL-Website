import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "About" };

const classes = [
  {
    name: "Qur’an",
    arabic: "القرآن",
    topics: ["Reading the Qur’an for beginners", "Talaqqi 7 Qira’ah", "Murottal", "Tajweed"],
  },
  { name: "Hadith", arabic: "الحديث" },
  { name: "Tafseer", arabic: "التفسير" },
  { name: "Islamic Jurisprudence", arabic: "الفقه" },
  { name: "Seerah", arabic: "السيرة" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="About the centre" arabic="عن المركز" />

      <div className="about-body">
        <div className="wrap">
          <p className="lede">
            In Islam, every child is born in a pure state, called fitrah. As human beings, perfectly
            created compared to other creations such as animals, it is natural for each of us to seek
            answers to where we come from, why we were created, and what we are doing here on earth.
            These questions have bothered me for as long as I can remember. I started seeking
            knowledge from various sources, and it took me years to finally be hooked on this faith.
          </p>
          <p>
            Through this centre, I would like to dedicate my life to teaching what I’ve learned and
            fulfilling my duty as someone granted knowledge by Allah the Almighty.
          </p>

          <figure className="hadith">
            <p className="narrator">
              Abu Huraira reported: The Messenger of Allah, peace and blessings be upon him, said:
            </p>
            <p className="arabic" lang="ar">
              وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ وَمَا
              اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ وَيَتَدَارَسُونَهُ بَيْنَهُمْ إِلاَّ
              نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ وَغَشِيَتْهُمُ الرَّحْمَةُ وَحَفَّتْهُمُ الْمَلاَئِكَةُ وَذَكَرَهُمُ اللَّهُ
              فِيمَنْ عِنْدَهُ
            </p>
            <blockquote>
              Whoever travels a path in search of knowledge, Allah will make easy for him a path to
              Paradise. People do not gather in the houses of Allah, reciting the book of Allah and
              studying it together, but that tranquillity will descend upon them, mercy will cover
              them, angels will surround them, and Allah will mention them to those near him.
            </blockquote>
            <figcaption className="source">
              Source: Ṣaḥīḥ Muslim 2699. Grade:{" "}
              <a
                href="https://abuaminaelias.com/dailyhadithonline/2012/01/15/allah-helps-brother/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sahih
              </a>
            </figcaption>
          </figure>

          <p className="dua">
            May Allah the Almighty, the Lord of the Universe, destine our lives together on this
            journey and gather us in the blessed environment of this class and in the hereafter.
            Ameen.
          </p>
        </div>
      </div>

      <section className="classes" id="classes" aria-labelledby="classes-title">
        <div className="wrap">
          <h2 id="classes-title">Classes</h2>
          <ul className="class-list">
            {classes.map((c) => (
              <li className="class-item" key={c.name}>
                <h3>{c.name}</h3>
                <span className="ar" lang="ar">{c.arabic}</span>
                {c.topics && (
                  <ul aria-label={`${c.name} classes`}>
                    {c.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <p className="more">More classes will be added over time.</p>
        </div>
      </section>
    </>
  );
}
