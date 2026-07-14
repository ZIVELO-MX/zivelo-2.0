/* ZIVELO — Tweaks panel wiring */
const TWEAK_DEFAULTS = {
  "hero": "a"
};

function ZiveloTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    if (window.__applyTweaks) window.__applyTweaks(t);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Hero direction" />
      <TweakRadio
        label="Layout"
        value={t.hero}
        options={[
          { value: "a", label: "Split" },
          { value: "b", label: "Centered" },
          { value: "c", label: "Index" },
        ]}
        onChange={(v) => setTweak("hero", v)}
      />
    </TweaksPanel>
  );
}

const tweaksRootEl = document.getElementById("tweaks-root");
if (tweaksRootEl) {
  ReactDOM.createRoot(tweaksRootEl).render(<ZiveloTweaks />);
}
