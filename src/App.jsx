import SiteFooter from "./components/siteFooter/index.jsx";
import SiteHeader from "./components/siteHeader/index.jsx";
import WorldClockBoard from "./components/worldClockBoard/index.jsx";
import styles from "./App.module.css";

const App = () => (
    <div className={styles.appShell} id="top">
        <SiteHeader />
        <main className={styles.pageContent}>
            <section className={styles.hero} id="planner">
                <div className={styles.heroCopy}><p>WORLD TIME PLANNER</p><h1>Find the hour <span>that brings you together.</span></h1><div>Choose a moment in your day and see how it lands around the world.</div></div>
                <div className={styles.heroOrbit} aria-hidden="true"><span /><span /><span /><i /></div>
            </section>
            <WorldClockBoard />
        </main>
        <SiteFooter />
    </div>
);

export default App;
