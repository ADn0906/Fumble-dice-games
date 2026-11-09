package com.fumbledice.games;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public final class GameActivity extends Activity {
    private static final String GAME_HOST = "fdc-pixel-quest.axel-parra06.chatgpt.site";
    private WebView game;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/jeu/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();
        game = new WebView(this);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!BuildConfig.ONLINE) return true;
                String host = request.getUrl().getHost();
                return !"https".equals(request.getUrl().getScheme())
                    || !(GAME_HOST.equals(host) || "chatgpt.com".equals(host)
                        || "auth.openai.com".equals(host));
            }

            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (BuildConfig.ONLINE) return null;
                String path = request.getUrl().getPath();
                if ("/api/me".equals(path)) return json(200, "OK", "{\"player\":null}");
                if (path != null && path.startsWith("/api/")) {
                    return json(503, "Unavailable",
                        "{\"error\":\"Les comptes et classements sont disponibles sur la version web.\"}");
                }
                return assets.shouldInterceptRequest(request.getUrl());
            }
        });
        setContentView(game);
        game.loadUrl(BuildConfig.ONLINE ? "https://" + GAME_HOST : "https://appassets.androidplatform.net/jeu/index.html");
    }

    private static WebResourceResponse json(int code, String reason, String body) {
        return new WebResourceResponse("application/json", "UTF-8", code, reason,
            Collections.emptyMap(), new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8)));
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override protected void onPause() {
        game.evaluateJavascript("document.querySelector('#fdc-intro video')?.pause(); if(typeof music !== 'undefined') music.pause();", null);
        game.onPause();
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (game != null) {
            game.onResume();
            game.evaluateJavascript("(() => {const v=document.querySelector('#fdc-intro:not([hidden]) video'); if(v) v.play().catch(()=>{});})();", null);
        }
    }
}
