import React, {useContext, useEffect, useState} from "react";
import AppContext from "../../state/AppContext";

const NonAdminUserList = () => {
    const globalState = useContext(AppContext);
    const [regularUsers, setRegularUsers] = useState([]);
    const [nonAdminUserEmailFilter, setNonAdminUserEmailFilter] = useState('');

    function effectBody() {
        globalState.regularUsersStore.getAll(globalState);
        globalState.regularUsersStore.emitter.addListener('GET_REGULAR_USERS_SUCCESS', () => {
            setRegularUsers(globalState.regularUsersStore.data);
        });
    }

    useEffect(() => {
        effectBody();
    }, []);

    return (
        <div>
            <h1>Regular Users</h1>
            <div>
                <p>Filter by email: </p>
                <input type="text" name={'nonAdminUserEmailFilter'} onChange={(e) => {
                    setNonAdminUserEmailFilter(e.target.value)
                }} />
            </div>
            <div>
                {regularUsers.map(user => (
                    <div key={user.email} style={{display: 'flex', flexDirection: 'row', gap: '0.5rem'}}>
                        <p>{user.email}</p>
                        <button
                            onClick={async () => {
                                await globalState.regularUsersStore.deleteOne(globalState, user.id);
                                effectBody();
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