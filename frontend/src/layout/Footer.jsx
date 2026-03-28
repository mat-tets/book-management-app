import { BiLinkExternal } from "react-icons/bi";

import styles from "./Footer.module.css";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className={styles.root}>
      <div className={styles.main}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={styles.license}>
          <div className={styles.library}>
            <p>
              本サービスで提供するのメタデータの一部は、国立国会図書館サーチのAPIから取得した[国立国会図書館蔵書]（[国立国会図書館]が運営）に由来します。
            </p>
            <p>
              ライセンスは
              <a
                href="https://creativecommons.org/licenses/by/4.0/legalcode.ja"
                target="_blank"
                rel="noopener noreferrer"
              >
                クリエイティブ・コモンズ 表示 4.0 国際 パブリック・ライセンス
                <BiLinkExternal />
              </a>
              です。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
