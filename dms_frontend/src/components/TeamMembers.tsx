import { useState } from "react";

import {Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import FormDialog from "./BasicComponents/FormDialog";

import PurpleButtonStyling from "./BasicComponents/PurpleButtonStyling";
import Search from "./BasicComponents/Search";
import ProfileIcon from "./BasicComponents/ProfileIcon";
import Filter from "./BasicComponents/Filter";

function TeamMembers() {

	//An object where each key is the category of people, and the value is an array of the people in that category
	const [members, setMembers] = useState({
		"Chief Executive Officers":["Jean-Luc Picard", "William Riker"],
		"Relationship Managers": ["Deanna Troi", "Beverly Crusher", "Worf"],
		"My Team Members": ["?"]
	});

	const [newName, setNewName] = useState("");
	const [newRole, setNewRole] = useState(-1);
	const [searchString, setSearchString] = useState("");

	const addMember = () =>{
	}
	
	return(
		<div>
			<p className="text-3xl font-bold m-7">Team Members</p>

			<div className='flex flex-row relative'>
				<div className=''>
          <Search setter={setSearchString} label="Search"/>
				</div>
				
				<div className='flex-auto'>
					<Filter setter={setSearchString} listsAreSame={true} labelList={Object.keys(members)} setPlaceholder={false} />
				</div>

				<div className="">
					<span className="font-light">{`${Object.values(members).map((value)=>{return value.length}).reduce((accumulator, curr)=>accumulator+curr)} members`}</span>
					<FormDialog
						triggerClassName={PurpleButtonStyling}
						triggerText={<><span className="text-xl">+ </span><span>Add Member</span></>}
						formTitle="Add Team Member"
						formSubmit= {addMember}
						submitButton= "Create User"
						form= {[
							{ category: "single", label: "Name", type: "text", setter: setNewName },
							{ category: "single", label: "Role", type: "select", setter: setNewRole, options: ["Maker", "Checker"] }
						]}
					/>
				</div>
			</div>

			<div className="mx-10 mt-5">
				{Object.keys(members).map((category: string)=>{
					return(
						<div>
							<p className="text-lg font-semibold">{category}</p>
							<div className="flex flex-row">
								{//@ts-ignore
								members[category].map((member)=>{
									return (
										<Card className="m-5 rounded-2xl bg-white w-72">
											<CardHeader>
												<CardTitle className="m-auto">
													<ProfileIcon name={member} size="large" />
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-center font-medium">{member}</p>
												<p className="text-center font-light">{category}</p>
											</CardContent>
										</Card>
									)})}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default TeamMembers;