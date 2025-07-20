import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ fontSize: "2.5rem", margin: "2rem 0 1rem", textAlign: "center", fontFamily: "monospace" }}>
          Josh Mu&apos;s Sandbox 🏝️
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem", textAlign: "center" }}>
          Welcome to my experimentation playground
        </p>
        <ol>
          <li>Breaking things, learning patterns, and pushing boundaries</li>
        </ol>

        <div className={styles.ctas} style={{ justifyContent: "center" }}>
          <a
            className={styles.primary}
            href="https://github.com/joshmu"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/globe.svg"
              alt="GitHub icon"
              width={20}
              height={20}
            />
            Visit my GitHub
          </a>
          <a
            href="https://joshmu.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            joshmu.dev
          </a>
        </div>
        <Button appName="web" className={styles.secondary}>
          Experiment 🧪
        </Button>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://github.com/joshmu/sandbox"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Code icon"
            width={16}
            height={16}
          />
          View Source
        </a>
        <a
          href="https://joshmu.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          joshmu.dev →
        </a>
      </footer>
    </div>
  );
}