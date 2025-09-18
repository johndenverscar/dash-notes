cask "rolodex" do
  version "1.0.0"
  sha256 "38c0c0e3f7aa99283dfea71e561e4665c0a760256858e8f5086ff270d8e583ed"

  url "https://github.com/YOUR_USERNAME/rolodex/releases/download/v#{version}/Rolodex-#{version}.dmg"
  name "Rolodex"
  desc "Quick note-taking app with global hotkey"
  homepage "https://github.com/YOUR_USERNAME/rolodex"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "Rolodex.app"

  zap trash: [
    "~/Library/Application Support/Rolodex",
    "~/Library/Preferences/com.rolodex.app.plist",
    "~/Library/Saved Application State/com.rolodex.app.savedState",
  ]
end