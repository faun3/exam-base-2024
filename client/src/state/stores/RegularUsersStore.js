import EventEmitter from "../../utils/EventEmitter";
import { SERVER } from "../../config/global";

class RegularUsersStore {
    constructor() {
        this.data = [];
        this.count = 0;
        this.emitter = new EventEmitter();
    }

    async getAll(state) {
        try {
            const resp = await fetch(`${SERVER}/api/users/regular`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': state.user.data.token
                }
            })

            if (!resp.ok) {
                throw resp;
            }

            this.data = await resp.json()
            this.count = this.data.length
            this.emitter.emit('GET_REGULAR_USERS_SUCCESS')
        } catch (e) {
            console.warn(e);
            this.emitter.emit('GET_REGULAR_USERS_ERROR')
        }
    }

    async deleteOne(state, id) {
        try {
            const resp = await fetch(`${SERVER}/api/users/${id}`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': state.user.data.token
                }
            })

            if (!resp.ok) {
                throw resp;
            }

            this.data = this.data.filter(user => user.id !== id)
            this.count = this.data.length
        } catch (e) {
            console.warn(e);
            this.emitter.emit('DELETE_REGULAR_USER_ERROR')
        }
    }
}

export default RegularUsersStore;
