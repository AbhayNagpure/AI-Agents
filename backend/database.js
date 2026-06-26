const users = [
    { id: "101", name: "Alice Smith", email: "alice@example.com", plan: "pro", active: true },
    { id: "102", name: "Bob Jones", email: "bob@example.com", plan: "free", active: false },
    { id: "103", name: "Charlie Brown", email: "charlie@example.com", plan: "pro", active: true },
    { id: "104", name: "Diana Prince", email: "diana@example.com", plan: "enterprise", active: true }
];

//Tool to get user by id
export function getUserById(id){
    console.log(`Database querying user by id: ${id}`);
    const user = users.find(u => u.id === id);
    return user ? user : {error: "User not found"};
}

//Tool 2 Get a list of all users on a specific subscription plan.
export function getUsersByPlan(plan){
    console.log(`Database querying users on plan: ${plan}`);
    const matchingUsers = users.filter(u => u.plan.toLowerCase() === plan.toLowerCase());
    return matchingUsers.length > 0 ? matchingUsers : {error: "No user found on this plan"};
}
