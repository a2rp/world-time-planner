import { FaGlobeAmericas, FaGithub } from "react-icons/fa";
import styles from "./styles.module.css";

const SiteHeader = () => (
    <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="Hourline home"><span className={styles.brandIcon}><FaGlobeAmericas aria-hidden="true" /></span><span>hourline</span></a>
        <nav className={styles.navigation} aria-label="Main navigation"><a href="#planner">Plan a time</a><a href="#clocks">City board</a></nav>
        <a className={styles.repositoryLink} href="https://github.com/a2rp/world-time-planner" target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" /><span>Repository</span></a>
    </header>
);

export default SiteHeader;
