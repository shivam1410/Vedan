# Vedan

## Description
This is a basic PDF manager developed in Ionic with core being Angular.<br>
I'm building this app according to my needs. This pdf viewer is like a Library. currently i've kept minimal functionality of listing, viewing of PDFs, located in Books folder of your internal directory and external both. Ionic dont have any native plugin to open a pdf so it uses [Sitewart cleverdox viewer](https://play.google.com/store/apps/details?id=de.sitewaerts.cleverdox.viewer).x
</br>

## Installation Ionic
follow the Official Documentation of [Ionic](https://ionicframework.com/docs/installation/cli) to install the Cli on your System. Make sure to follow all the steps.
</br>

## Plugins used
- cordova-plugin-file
- cordova-plugin-file-opener2
- [cordova-plugin-document-viewer](https://github.com/sitewaerts/cordova-plugin-document-viewer)
</br>

## Creating APK
creating the apk can be trick part
` ionic cordova build android --prod --release` gives you `app-release-unsigned.apk` but `ionic cordova build android --prod` gives you `app-debug.apk`. So you gotta make you unsignes version signed. so that you can install it on your Android.</br>

**These are the few steps for same**</br>
 - **To create the build**</br>
 `ionic cordova build android --prod --release`
 - **Copy apk file to main folder**</br>
 `cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk app-release-unsigned.apk`
 - **Create your signature**</br>
 `keytool -genkey -v -keystore Vedan.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000`
 - **Sign your apk with your signature**</br>
 `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore Vedan.keystore app-release-unsigned.apk alias_name`
 - **Verify (zipalign can be found in Android/Sdk/build-tools/28.0.3/)**</br>
 `zipalign  -v 4 app-release-unsigned.apk Vedan.apk`
</br>

## ScreenShots
![Main Home](/src/assets/Screenshot_20200318-152719.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-152733.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-152738.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-182206.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-182212.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-101604.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-152825.jpg?raw=true "Title")
![alt text](/src/assets/Screenshot_20200318-182224.jpg?raw=true "Title")
</br>

## References
- [Ionic icons](https://ionicframework.com/docs/v3/ionicons/)
- [Ionic Docs](https://ionicframework.com/docs/components)
- [cleverdox viewer](https://play.google.com/store/apps/details?id=de.sitewaerts.cleverdox.viewer)
- [Material Colors](https://material-ui.com/customization/color/)
