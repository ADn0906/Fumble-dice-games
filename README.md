# Fumble Dice Games

Ce dossier contient les sources web, les ressources du jeu et le projet Android.

## Compiler l’APK sur GitHub

1. Crée un dépôt privé et ajoute à sa racine le contenu du dossier décompressé, y compris le répertoire caché `.github`.
2. Dans le dépôt, ouvre **Actions → APK Android de test → Run workflow**.
3. Après réussite, télécharge **Fumble-Dice-Games-APK** dans les artefacts de l’exécution. Décompresse-le pour obtenir `app-online-debug.apk`.

La compilation utilise Java 17, Gradle 8.11.1 et le SDK Android 35. En local, avec ces outils installés, lance `gradle -p android :app:assembleOnlineDebug` depuis la racine.

## Périmètre de l’APK de test

L’APK en ligne ouvre le jeu hébergé, avec les comptes du jeu et le classement commun à Android, Safari et iPhone. Chaque ami doit disposer de l’accès au site privé et jouer connecté à son compte Fumble Dice Games pour que son score soit enregistré. La connexion au site privé via WebView doit être vérifiée sur un téléphone avant de distribuer l’APK.

Pour une version de test hors ligne, compile `:app:assembleOfflineDebug`. Elle embarque le jeu et garde la progression sur l’appareil. Le serveur et son schéma sont dans `worker/` et `drizzle/`.

Sur iPhone, ouvre le même lien dans Safari, puis choisis Partager → Sur l’écran d’accueil. Pour une version iOS native distribuée par TestFlight, prépare et signe une cible iOS dans Xcode, puis envoie le build à App Store Connect.

L’APK de test est signé avec une clé de débogage. Une version distribuée durablement doit disposer de sa propre clé de signature. Garde cette clé en dehors du dépôt.
