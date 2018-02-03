export type User = {
  uid: string,
  username: string,
  first_name: string,
  last_name: string,
  sex: string,
  birth_year: number, //deprecated
  birth_date: number,
  profile_img: string,
  cover_img: string,
  is_verified: boolean,
  is_pro: boolean,
  uploaded_id: boolean,
  city: string,
  occupation: string,
  tags: Array<string>,
  phone: string,
  current_status: string,
  organization: string,
  tax_id: string,
  rating: number,
  is_deleted: boolean,
  eventsCreated: Object,
  secretEventsCreated:Object,
}

export type EventUser = {
  uid: string,
  first_name: string,
  last_name: string,
  profile_img_url: string,
  username: string,
  organization: string,
}

export type EventCover = {
  mime: string,
  width: number,
  height: number,
  uri: string,
}

export type EventVideoCover = {
  timestamp: number,
  uri: string,
}

export type EventAudioCover = {
  uri: string,
}

export type EventTicket = {
  name: string,
  price: number,
  qty: number,

  //Internal properties (used only by this app)
  _key: string
}

export type EventContribution = {
  name: string,
  qty: number,
}

export type Event = {
  name: string,
  description: string,
  location: Array<number, number>,
  user: EventUser,
  timestamp: number,
  min_price: number,
  max_price: number,
  attendance_limit: number,
  attendance_count: number,
  cover_img: string,
  cover_storage_ref: string,
  cover_video: string,
  cover_video_storage_ref: string,
  cover_audio: string,
  cover_audio_storage_ref: string,
  start_datetime: number,
  end_datetime: number,
  place_type: number,
  is_private: boolean,
  is_active: boolean,
  is_secret: boolean,
  is_free: boolean,
  categories: Array<string>,
  prices: Array<EventTicket>,
  google_place_id: string,
  address: string,

  //Internal properties (used only by this app)
  _key: string
}

export type PrivateEventCoordinates = {
  location: Array<number, number>,
  address: string,
}

export type UserCard = {
  exp_month: string,
  exp_year: number,
  last4: string,
  brand: string,
}

export type UserBankAccount = {
  account_number: string
}

export type StripeCard = {
  name: string,
  number: string,
  exp_month: string,
  exp_year: number,
  cvc: string,
}

export type StripeBankAccount = {
  id: string,
  bank_name: string,
  last4: string,
  routing_number: string,
  currency: string,
  country: string,
}

export type StripeCardResponse = {
  id: string,
  object: string,
  address_city: string,
  address_country: string,
  address_line1: string,
  address_line1_check: string,
  address_line2: string,
  address_state: string,
  address_zip: string,
  address_zip_check: string,
  brand: string,
  country: string,
  customer: string,
  cvc_check: string,
  dynamic_last4: string,
  exp_month: number,
  exp_year: number,
  fingerprint: string,
  funding: string,
  last4: string,
  metadata: Object,
  name: string,
  tokenization_method: string
}

export type ImageMeta = {
  mime: string,
  width: number,
  height: number,
  uri: string,
}

export type FileUploadMeta = {
  ref: string,
  url: string,
}

export type PostImage = {
  url: string,
  storage_ref: string,
  width: number,
  height: number,
}

export type Post = {
  comment: string,
  timestamp: number,
  images: Array<PostImage>
}
