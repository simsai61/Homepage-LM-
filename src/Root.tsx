import "./index.css";
import { Composition, Still } from "remotion";
import { ComebackBild } from "./story/ComebackBild";
import { UrlaubBild } from "./story/UrlaubBild";

// Textvariante 3 („Akkus voll" + Homepage-Teaser) und 4 („Schild wieder an").
const COMEBACK_AKKUS = {
  kicker: "WIR SIND ZURÜCK",
  zeile1: "AKKUS VOLL.",
  zeile2: "ES GEHT LOS.",
  abDatum: "Montag, 17.08.",
  sub: "Und bald online: unsere neue Homepage.",
};
const COMEBACK_SCHILD = {
  kicker: "DAS SCHILD IST WIEDER AN",
  zeile1: "ZURÜCK AUS",
  zeile2: "DEM URLAUB.",
  abDatum: "Montag, 17.08.",
  sub: "Der Laden läuft — es geht wieder los.",
};
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import {
  STORY_DURATION,
  STORY_FPS,
  STORY_HEIGHT,
  STORY_WIDTH,
  StoryVideo,
} from "./story/StoryVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still
        id="UrlaubPost"
        component={UrlaubBild}
        width={1080}
        height={1350}
        defaultProps={{
          zeitraum: "31.07. — 14.08.",
          jahr: "2026",
          zurueckTag: "Montag, 17.08.",
        }}
      />
      <Still
        id="UrlaubStory"
        component={UrlaubBild}
        width={1080}
        height={1920}
        defaultProps={{
          zeitraum: "31.07. — 14.08.",
          jahr: "2026",
          zurueckTag: "Montag, 17.08.",
        }}
      />
      <Still
        id="ComebackAkkusPost"
        component={ComebackBild}
        width={1080}
        height={1350}
        defaultProps={COMEBACK_AKKUS}
      />
      <Still
        id="ComebackAkkusStory"
        component={ComebackBild}
        width={1080}
        height={1920}
        defaultProps={COMEBACK_AKKUS}
      />
      <Still
        id="ComebackSchildPost"
        component={ComebackBild}
        width={1080}
        height={1350}
        defaultProps={COMEBACK_SCHILD}
      />
      <Still
        id="ComebackSchildStory"
        component={ComebackBild}
        width={1080}
        height={1920}
        defaultProps={COMEBACK_SCHILD}
      />
      <Composition
        id="InstagramStory"
        component={StoryVideo}
        durationInFrames={STORY_DURATION}
        fps={STORY_FPS}
        width={STORY_WIDTH}
        height={STORY_HEIGHT}
      />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
