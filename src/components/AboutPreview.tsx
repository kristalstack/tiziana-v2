import Image from "next/image";
import Link from "next/link";
import TizianaName from "./TizianaName";

export default function AboutPreview({ locale }: { locale: string }) {
  const es = locale !== "en";
  return <section className="premium-founder founder-first" aria-labelledby="founder-title">
    <div className="premium-founder-inner">
      <div className="premium-founder-portrait"><Image src="/kristal-hero.png" alt={es ? "Fotografía de Kristal Pastor" : "Photograph of Kristal Pastor"} fill priority sizes="(max-width: 900px) 100vw, 44vw" className="premium-founder-photo" /></div>
      <div className="premium-founder-copy">
        <p className="premium-founder-kicker">{es ? "LA PERSONA DETRÁS DE TIZIANA" : "THE PERSON BEHIND TIZIANA"}</p>
        <h1 id="founder-title">{es ? "Hola, soy Kristal Pastor." : "Hi, I'm Kristal Pastor."}</h1>
        <p className="premium-founder-role"><>{es ? "Psicóloga · Escritora · Creadora de " : "Psychologist · Writer · Creator of "}<TizianaName locale={locale}/></></p>
        <div className="premium-founder-rule" />
        <h2>{es ? "Después de 17 años de matrimonio, volví al mundo de las citas. Y descubrí cuánto había cambiado." : "After 17 years of marriage, I started dating again. So much had changed."}</h2>
        <p>{es ? "Apps, mensajes, dejar en visto, señales que no sabemos cómo interpretar... Hablando con otras personas descubrí que muchos compartíamos preguntas parecidas sobre las relaciones de hoy." : "Apps, texts, being left on read, mixed signals... Talking with other people, I realized how many of us had the same questions about modern relationships."}</p>
        <p>{es ? "Soy licenciada en Psicología por la Universidad Intercontinental (UIC), en Ciudad de México. Mi experiencia y mis estudios de programación me llevaron a una idea: ¿y si pudiéramos aprovechar la tecnología digital para ver nuestras experiencias de pareja con más claridad, reconocer patrones y entender lo que a veces solo tenemos dando vueltas en la cabeza?" : "I studied psychology at Universidad Intercontinental in Mexico City. My own experiences and studies in programming led me to an idea: what if digital technology could help us see our relationship experiences more clearly, recognize patterns, and make sense of what usually stays in our heads?"}</p>
        <p><strong>{es ? "De esa pregunta nacieron La psicología del dating y " : "That question led to The Psychology of Dating and "}<TizianaName locale={locale}/>.</strong></p>
        <Link className="premium-founder-link" href={`/${locale}/about`}>{es ? "Lee mi historia" : "Read my story"} <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>;
}
