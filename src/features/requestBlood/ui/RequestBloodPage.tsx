import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import RequestBloodForm   from "../container/Requestbloodform";
import RequestBloodSidebar from "../container/Requestbloodsidebar";

const RequestBloodPage = () => {
  return (
    <SectionContainer className="min-h-screen bg-light">
      {/* Main content — overlaps hero */}
      <div className="-mt-8 relative z-10 pb-16">
        <MainContainer>
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Form — takes majority of width */}
            <div className="flex-1 min-w-0">
              <RequestBloodForm />
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 shrink-0">
              <RequestBloodSidebar />
            </div>

          </div>
        </MainContainer>
      </div>

    </SectionContainer>
  );
};

export default RequestBloodPage;