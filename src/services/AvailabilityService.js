import { AVAILABILITY, BOOK_A_SLOT, SET_CUSTOM_AVAILABILITY } from '../api/endpoints'
import serverApi from '../api'

class AvailabilityService {
  static async getAvailabilityForDate(date) {
    const { data } = await serverApi.get(AVAILABILITY, {
      params: {
        date,
      },
    })

    return data
  }

  static bookASlot(date, shift) {
    serverApi.post(BOOK_A_SLOT(date, shift))
  }

  static async setAvailability(date, shift, customValue) {
    const { data } = await serverApi.patch(SET_CUSTOM_AVAILABILITY(date, shift), {
      custom: customValue,
    })

    return data
  }
}

export default AvailabilityService
