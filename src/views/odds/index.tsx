import { Route, Routes } from 'react-router-dom';
import OddsListView from './OddsListView';
import OddsManagementView from './OddsManagementView';
import NotFoundView from '../NotFoundView';

const OddsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<OddsListView />} />
            <Route path="/:matchId" element={<OddsManagementView />} />
            <Route path="*" element={<NotFoundView />} />
        </Routes>
    );
};

export default OddsRoutes;
