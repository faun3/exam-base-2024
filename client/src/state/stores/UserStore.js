import EventEmitter from '../../utils/EventEmitter'
import {SERVER} from '../../config/global'

class UserStore {
    constructor() {
        this.data = {}
        this.emitter = new EventEmitter()
    }

    async login(email, password) {
        try {
            const response = await fetch(`${SERVER}/auth/login`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })
            if (!response.ok) {
                throw response
            }
            this.data = await response.json()
            this.emitter.emit('LOGIN_SUCCESS')
        } catch (err) {
            console.warn(err)
            this.emitter.emit('LOGIN_ERROR')
        }
    }

    async logout() {
        try {
            console.log(this.data)
            const response = await fetch(`${SERVER}/auth/logout`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: this.data.token
                })
            })
            if (!response.ok) {
                throw response
            }
            this.data = {}
            this.emitter.emit('LOGOUT_SUCCESS')
        } catch (err) {
            console.warn(err)
            this.emitter.emit('LOGOUT_ERROR')
        }
    }

    async register(email, password, type = 'regular') {
        try {
            const resp = await fetch(`${SERVER}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    type
                })
            });

            if (!resp.ok) {
                throw resp;
            }

            this.data = await resp.json();
            this.emitter.emit('REGISTER_SUCCESS');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('REGISTER_ERROR');
        }
    }
}

export default UserStore
