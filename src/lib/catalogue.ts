// Herman Suede releases. Artwork and 30s previews are Apple's official assets
// (iTunes Lookup API, fetched 27 Nov 2026). Spotify IDs checked to return 200.
export type Release = {
  title: string;
  artist: string;
  year: string;
  from: string;
  art: string;
  preview: string;
  apple: string;
  spotify?: string;
};

export const CATALOGUE: Release[] = [
  {
    title: "She Get", artist: "Herman Suede", year: "2026", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f1/0b/45/f10b4518-97a4-e002-a624-1ca898aa5f64/823375590934_Cover.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/86/7d/e7/867de7bf-28dd-5ed9-5497-8634939e1e33/mzaf_16667730978564218141.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/she-get/6833466578?i=6833466583",
    spotify: "https://open.spotify.com/track/0KvgjL7EWkXNgVMkbI1nHx",
  },
  {
    title: "ONE BY ONE II", artist: "Herman Suede & The Therapist", year: "2025", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f1/2f/c2/f12fc227-e43c-3a4c-1052-c13da77ad770/345546.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4d/a3/384da3bf-a78c-2f82-808f-85653870f964/mzaf_12915699795237464458.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/one-by-one-ii/1814555768?i=1814555769",
    spotify: "https://open.spotify.com/track/3MHTjBkjMmDu1fYjNDAy7F",
  },
  {
    title: "Kumbaya", artist: "Herman Suede", year: "2022", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/b5/79/15/b57915e3-a026-1a4b-1091-7afe44b2ad70/0.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/79/21/12/7921127a-1e66-87fc-d1c4-9680fb11afac/mzaf_760059412780952488.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/kumbaya/1648781226?i=1648781229",
  },
  {
    title: "Naa Kwarley", artist: "Herman Suede", year: "2021", from: "Bittersweet",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/56/68/b6/5668b640-71d9-ba2c-53ef-01ad1afb0500/artwork.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/70/a5/03/70a5037e-387c-1201-c052-ece8cd95eebc/mzaf_17543757196525179904.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/naa-kwarley/1587992498?i=1587992501",
  },
  {
    title: "One by One", artist: "Herman Suede", year: "2020", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/10/3f/14/103f144f-bcd1-6e57-af10-a188e1655c9b/artwork.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/a7/39/eea739d5-541e-96a8-7b86-d1e979cc14e6/mzaf_12956757920937556980.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/one-by-one/1526996073?i=1526996074",
    spotify: "https://open.spotify.com/track/0mfwWliY4X4TlfOHGJ3gru",
  },
  {
    title: "Free", artist: "Herman Suede", year: "2020", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8b/e5/f7/8be5f7cf-7faa-6b57-e8eb-fa2e4166d557/artwork.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9f/e9/6b/9fe96b1b-cb36-ec58-0e31-2e72cf6b01a7/mzaf_10470706638081406989.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/free/1499369975?i=1499370486",
  },
  {
    title: "Let Loose", artist: "Herman Suede feat. Asi", year: "2019", from: "Hi I'm Herman",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/97/08/61/9708614a-661c-aaeb-8d68-8a6a5f3e0f7d/artwork.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c0/30/90/c0309020-db2b-bd15-e543-6197ab8a779c/mzaf_1681723283096061783.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/let-loose-feat-asi/1471484182?i=1471484185",
  },
  {
    title: "Pretty Mama", artist: "Herman Suede", year: "2018", from: "Single",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/d0/f2/e9/d0f2e90d-bdfd-a528-417d-db8f164ed916/artwork.jpg/600x600bb.jpg",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/97/c8/ea/97c8ea32-e044-b388-bb59-4d81439bd0fc/mzaf_9713809623444364792.plus.aac.p.m4a",
    apple: "https://music.apple.com/us/album/pretty-mama/1416433065?i=1416433066",
  },
];
