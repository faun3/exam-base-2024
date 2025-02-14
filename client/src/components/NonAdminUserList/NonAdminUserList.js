import React, {useContext, useEffect, useState} from "react";
import AppContext from "../../state/AppContext";

const NonAdminUserList = () => {
    const globalState = useContext(AppContext);
    const [regularUsers, setRegularUsers] = useState([]);

    useEffect(() => {
        globalState.regularUsersStore.getAll(globalState);
        globalState.regularUsersStore.emitter.addListener('GET_REGULAR_USERS_SUCCESS', () => {
            setRegularUsers(globalState.regularUsersStore.data);
        });
    }, [regularUsers]);

    return (
        <div>
            <h1>Regular Users</h1>
            <div>
                {regularUsers.map(user => (
                    <div key={user.email} style={{display: 'flex', flexDirection: 'row', gap: '0.5rem'}}>
                        <p>{user.email}</p>
                        <button
                            onClick={() => {
                                globalState.regularUsersStore.deleteOne(globalState, user.id);
                            }}
                        >Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NonAdminUserList;