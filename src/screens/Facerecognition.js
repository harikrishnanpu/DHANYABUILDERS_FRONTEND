import React, { useEffect, useRef } from 'react'
import FaceRecognition from '../components/Facerecognition'
import axios from 'axios'
import { useSelector } from 'react-redux';
import {useNavigate} from 'react-router-dom'

function Facerecognition() {

    const navigate = useNavigate();
    const userSignin = useSelector((state) => state.userSignin);
    const { userInfo } = userSignin;

      // Initialize All Required DOM Elements
const modalOverlay = useRef(null);
const modalLoginOverlay = useRef(null);

// const location = useLocation(); // Access location object
// const query = new URLSearchParams(location.search); // Access query parameters
// const ref = query.get('ref'); 

useEffect(()=>{

  if(!userInfo){
    navigate('/signin')
  }

  if(localStorage.getItem('faceId')){
    navigate('/')
  }

  try {
  const FoundFaceData = axios.get(`/api/users/get-face-data/${userInfo._id}`)

  if(FoundFaceData.data.faceDescriptor.length !==0){
        modalLoginOverlay.current.classList.add("visible")
  }else{
    modalOverlay.current.classList.add("visible")
  }
  }catch(error){
      modalOverlay.current.classList.add("visible")
  }

},[userInfo,navigate])

function modalClose (){
  if(modalOverlay.current.classList.contains('visible')){
    modalOverlay.current.classList.remove('visible')
    localStorage.setItem('modalShown', true)
  }
}


function modalLoginClose (){
    if(modalLoginOverlay.current.classList.contains('visible')){
      modalLoginOverlay.current.classList.remove('visible')
      localStorage.setItem('modalShown', true)
    }
  }

  return (
    <div>


<section className="modal">
	<div className="modal-overlay" id="modalOverlay" ref={modalOverlay}>
		<div className="modal-content">
			<div className="modal-detail">
				<span className="modal-icons"><i className="fas fa-camera"></i></span>
				<h3 className="text-2xl font-bold">Face Recognition</h3>
				<p className="text-sm mb-4">
					Register Your Face by Clicking The Below Button
				</p>
			</div>
      <FaceRecognition modal={modalClose} />
		</div>
	</div>
</section>


<section className="modal">
	<div className="modal-overlay" id="modalLoginOverlay" ref={modalLoginOverlay}>
		<div className="modal-content">
			<div className="modal-detail">
				<span className="modal-icons"><i className="fas fa-camera"></i></span>
				<h3 className="text-2xl font-bold">Face Recognition</h3>
				<p className="text-sm mb-4">
					Unlock Your Face Id by clicking the Button Below
				</p>
			</div>
      <FaceRecognition login={true} modal={modalLoginClose} />
		</div>
	</div>
</section>

    </div>
  )
}

export default Facerecognition