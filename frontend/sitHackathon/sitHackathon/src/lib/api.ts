//const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const apiUrl = 'http://localhost:3000';// remove this statement in prod and uncomment the above in . 
if(!apiUrl)
{
    console.log("backend inaccessible bhejcnhod");
}

export interface userLogin{
    phoneNo?: string;
    emailId?: string;
    otp?:string;

}
export interface userSignUp{
    phoneNo?: string;
    emailId?:string;
    companyName?:string;
    positionInCompany?:string;
}
