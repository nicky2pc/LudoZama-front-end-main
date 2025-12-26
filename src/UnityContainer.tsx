import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useUnityEventSystem } from "./hooks/unity/useUnityEventSystem";
import sdk from "@farcaster/miniapp-sdk";

export function UnityContainer() {
  const {
    unityProvider,
    loadingProgression,
    isLoaded,
    initialisationError,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: "unity/webbuild.loader.js",
    dataUrl: "unity/webbuild.data.unityweb",
    frameworkUrl: "unity/webbuild.framework.js.unityweb",
    codeUrl: "unity/webbuild.wasm.unityweb",
  });

  const [devicePixelRatio, setDevicePixelRatio] = useState(
    window.devicePixelRatio
  );
  const [isReadyToStart, setIsReadyToStart] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useUnityEventSystem({
    addEventListener,
    removeEventListener,
    sendMessage,
    isLoaded,
  });

  useEffect(() => {
    const updateDevicePixelRatio = () => {
      setDevicePixelRatio(window.devicePixelRatio);
    };
    const mediaMatcher = window.matchMedia(
      `screen and (resolution: ${devicePixelRatio}dppx)`
    );
    mediaMatcher.addEventListener("change", updateDevicePixelRatio);
    return () => {
      mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
    };
  }, [devicePixelRatio]);

  useEffect(() => {
    if (isLoaded) {
      setIsReadyToStart(true);
    }
  }, [isLoaded]);

  if (initialisationError) {
    console.error("Unity initialisation error:", initialisationError);
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <p className="text-white text-center mx-auto">
          Error loading application. Please try again later or try another
          device.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        width: "100vw",
        height: "100vh",
        padding: "env(safe-area-inset)",
      }}
    >
      {/* Фон + загрузка */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white"
          style={{
            backgroundColor: "#000",
            backgroundImage: "url('/LoadScreen.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p
            style={{
              marginTop: "375px", // ← добавили отступ вниз
              fontSize: "1.25rem",
            }}
          >
            Loading... ({Math.round(loadingProgression * 100)}%)
          </p>
        </div>
      )}

      {/* Кнопка запуска */}
      {isReadyToStart && !hasStarted && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white"
          style={{
            backgroundColor: "#000",
            backgroundImage: "url('/LoadScreen.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexDirection: "column",
          }}
        >
          <button
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.25rem",
              backgroundColor: "#8a2be2" /* Purple */,
              color: "#fff",
              border: "4px solid #ffffff",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(138, 43, 226, 0.6)",
              transition: "all 0.3s ease",
              fontWeight: "bold",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
            onClick={() => setHasStarted(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#9932cc";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#8a2be2";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Start Game
          </button>

          {/* Social Media Buttons */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {/* X Button */}
            <button
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundImage: "url('/X_icon.svg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "4px solid #ffffff",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease",
              }}
              onClick={() => sdk.actions.openUrl("https://x.com/Ludonad_game")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(255, 255, 255, 0.8)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(255, 255, 255, 0.5)";
              }}
            />

            {/* Farcaster Button */}
            <button
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundImage: "url('/farcaster1665155443308.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "4px solid #ffffff",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease",
              }}
              onClick={() =>
                sdk.actions.openUrl("https://farcaster.xyz/~/channel/ludonad")
              }
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(255, 255, 255, 0.8)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(255, 255, 255, 0.5)";
              }}
            />
          </div>
        </div>
      )}

      {/* Unity контейнер */}
      {hasStarted && (
        <div
          style={{
            width: "99vw", // ⬅️ на 10% меньше
            height: "97vh",
            aspectRatio: "9 / 16",
            backgroundColor: "#000",
            overflow: "hidden",
          }}
        >
          <Unity
            unityProvider={unityProvider}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              imageRendering: "auto",
            }}
            devicePixelRatio={devicePixelRatio}
          />
        </div>
      )}
    </div>
  );
}
