export type GetMeTwitterResponse = {
    data: {
      id: string // X id
      name: string // X name
      username: string // X handle
      profile_image_url: string // avatar url
    },
    errors?: {
      detail: string,
      status: number,
      title: string,
      type: string
    }
  }