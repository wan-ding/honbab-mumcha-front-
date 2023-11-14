import axios from "axios";
import Button from "../components/Button";
import Heart from "../components/Heart";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const Card = ({ boardDto, user }) => {
  const [active, setActive] = useState(false);
  const [joinStatus, setJoinStatus] = useState("join-status-default");
  const [buttonText, setButtonText] = useState("참여하기");
  const [isLoading, setIsLoading] = useState(true);
  let date = new Date(boardDto.regDate);
  // 날짜 및 시간 형식 지정
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  // 지역화된 문자열로 변환
  date = date
    .toLocaleDateString("ko-KR", options)
    .replace(/\./g, "-")
    .replace(/ /g, "");

  const enterParty = () => {
    //로그인 되어 있지 않으면 로그인 페이지로
    if (user === null) {
      alert("로그인이 필요합니다");
      sessionStorage.setItem("togoUrl", "/boardList");
      window.location.href = "/login";
    } else {
      //로그인 되어 있다면 서버에 참가하기 요청
      axios
        .post("http://localhost:8080/api/app/participate", {
          boardNo: boardDto.boardId,
          email: user.email,
          username: user.username,
        })
        .then((response) => {
          console.log("what" + response);
          let confirmMove = window.confirm(
            "참가신청이 완료되었습니다.\n마이페이지로 이동하시겠습니까?"
          );
          if (confirmMove) {
            window.location.href = "/my";
          } else {
            window.location.reload();
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            alert(error.response.data);
            //console.log(error.response);
          } else if (error.response.status === 401) {
            alert("권한이 없습니다. 로그인해주세요.");
            sessionStorage.setItem("togoUrl", "/boardList");
            window.location.href = "/login";
          } else alert("Client : 서버 오류");
        });
    }
  };

  const bringStatus = async (e) => {
    //로그인 되어 있지 않으면 함수 종료, requestStatus는 기본값
    if (user === null) {
      return;
    } else {
      //로그인 되어 있다면 유저와보드로 participants를 검색
      //status = [1:수락 0:대기 -1:거절 -99:참여정보 없음]
      await axios
        .post("http://localhost:8080/api/app/find/participants", {
          boardNo: boardDto.boardId,
          email: user.email,
          username: user.username,
        })
        .then((response) => {
          if (response.data === 1) {
            setJoinStatus("join-status-accepted");
            setButtonText("참여중");
          } else if (response.data === 0) {
            setJoinStatus("join-status-pending");
            setButtonText("대기중");
          } else if (response.data === -1) {
            setJoinStatus("join-status-rejected");
            setButtonText("거절됨");
          } else return;
        })
        .then(() => {
          setIsLoading(false); // axios 통신이 끝나면 isLoading을 false로 설정
        });
    }
  };

  useEffect(() => {
    bringStatus();
  }, [joinStatus]);

  if (isLoading) {
    return <LoadingSpinner />; // 로딩 중일 때는 이 메시지를 표시
  }

  return (
    <div className="bg-[#FDFDFD] w-[15.625rem] h-[24.875rem] rounded-[1.25rem] relative">
      <div className="w-[14.25rem] h-[21.875rem] flex justify-between mx-auto">
        <div className="flex gap-2 ml-2 mt-[1.25rem]">
          <img className="w-[2.125rem] h-[2.125rem]" src="img/iamlogo.svg" />
          {/* 작성자 이름 */}
          <div className="text-[#000] text-[12px] mt-3">
            {boardDto.writer.name}
          </div>
        </div>
        {/* 작성일-reg_date */}
        <div className="text-[#BFBFBF] text-[10px] mt-[2.1rem] mr-[0.5rem]">
          {date}
        </div>
        {boardDto.regDate != boardDto.lastModified && (
          <span className="absolute top-12 right-[1.2rem] text-[#BFBFBF] text-[10px]">
            수정됨
          </span>
        )}
      </div>
      <img
        className="absolute top-[4.5rem] right-0 w-full h-[12.1875rem] "
        src="img/boardexampleimg.svg"
      />

      <Link to={`/boardDetail`} state={{ id: boardDto.boardId }}>
        {/* 글 제목-title */}
        <p className="absolute bottom-[6rem] left-[1rem] ml-1 text-[1rem] font-bold">
          {boardDto.title}
        </p>
      </Link>
      <Heart
        className="w-[1.5rem] absolute bottom-[6rem] right-[1.1rem]"
        isActive={active}
        onClick={() => setActive(!active)}
        animationTrigger="both"
        inactiveColor="rgba(255,125,125,.75)"
        activeColor="#E14949"
        animationDuration={0.1}
      />

      <ul className="list-disc absolute bottom-[3.8rem] left-[2rem] ">
        <li className="text-[#8B8686] text-[0.5rem]">태그1</li>
        <li className="text-[#8B8686] text-[0.5rem]">태그2</li>
      </ul>

      <div className="absolute bottom-[1rem] left-[1rem]">
        <div className="w-[14.25rem] h-[2rem] flex justify-between ">
          <Button type={joinStatus} onClick={enterParty}>
            {buttonText}
          </Button>
          {/* 상태에 따라 모집중 또는 모집완료 표시 */}
          {boardDto.status === 1 ? (
            <span className="mt-1 mr-4 text-[0.9rem] text-green-500 font-bold">
              모집중
            </span>
          ) : (
            <span className="mt-1 mr-4 text-[0.9rem] text-red-500 font-bold">
              모집완료
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
