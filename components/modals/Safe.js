import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Modal,
  Row,
  Snippet,
  Spinner,
  Tag,
  Text,
} from '@geist-ui/react';
import * as Icons from 'react-feather';
import makeStyles from '../makeStyles';

import { decryptData } from '../../utils/aes';
import { getSafeData } from '../../lib/safexDb';

const useStyles = makeStyles((ui) => ({
  content: {
    display: 'flex',
    flexDirection: 'row',
    width: ui.layout.pageWidthWithMargin,
    maxWidth: '100%',
    padding: `calc(${ui.layout.gap} * 2) `,
    boxSizing: 'border-box',
    margin: '0 auto',
  },
  avatar: {
    width: '100px !important',
    height: '100px !important',
    marginRight: '30px !important',
  },
  logo: {
    width: '32px !important',
    height: '32px !important',
    marginRight: '10px !important',
  },
  name: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
    height: 'fit-content !important',
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    lineHeight: 1,
    height: 'fit-content !important',
  },
  integrationsTitle: {
    textTransform: 'uppercase',
    color: `${ui.palette.accents_5} !important`,
    fontWeight: 500,
    fontSize: 12,
    margin: 0,
  },
  integrationsUsername: {
    margin: '0 0 0 4px',
    fontWeight: 0,
  },
  crypto: {
    width: '50px !important',
    height: '50px !important',
    marginRight: '25px !important',
  },
  card: {
    padding: '0 !important',
    marginBottom: `calc(${ui.layout.gap}*1.5) !important`,
    width: 'auto !important',
  },
  dot: {
    display: 'flex !important',
    marginTop: ui.layout.gapQuarter,
    overflow: 'hidden',
    alignItems: 'center !important',
    '& .icon': {
      backgroundColor: '#50e3c2 !important',
    },
    '& .label': {
      textTransform: 'none !important',
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    '& .label a': {
      display: 'inline-block',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: 14,
      lineHeight: 'normal',
    },
    '& .link': {
      fontWeight: 500,
    },
  },
  tag: {
    display: 'flex !important',
    alignItems: 'center',
    textTransform: 'capitalize !important',
    fontSize: '12px !important',
    padding: '3px 7px !important',
    borderRadius: '16px !important',
    height: 'unset !important',
    marginLeft: 8,
    color: `${ui.palette.foreground} !important`,
  },

  projects: {
    // width: '1040px !important',
    width: '80%',
    maxWidth: '100%',
  },
  modalContent: {
    border: '1px solid #EAEAEA',
    padding: '0 30px 0 30px',
    borderRadius: 5,
  },
}));

function Safe({ state, idx, safe, user, setSafeModal }) {
  const [safeData, setSafeData] = useState({});
  const [showSafe, setSafeShow] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSafe() {
      if (idx && safe.safeId) {
        console.log(idx);
        const safeData = await getSafeData(safe.safeId)

        const aesKey = await idx.ceramic.did.decryptDagJWE(
          safeData.encSafeKey
        );
        console.log(aesKey)
        const decryptedData = await decryptData(
          Buffer.from(safeData.encSafeData, 'hex'),
          aesKey
        );
        console.log(decryptedData)
        const res = JSON.parse(decryptedData.toString('utf8'));
        console.log(res)
        setSafeData(res)
        setLoading(false);
      }
      setModal(state);
    }
    loadSafe();
  }, [state, idx, safe]);



  const closeHandler = (event) => {
    setModal(false);
    setSafeModal(false);
  };
  const classes = useStyles();

  return (
    <>
      <Modal width={'55%'} height={'auto'} open={modal} onClose={closeHandler}>
        <Modal.Title>Safe details</Modal.Title>

        <Modal.Content>
          <div className={classes.modalContent}>
            {loading ? (
              <div>
                <Row
                  gap={0.8}
                  justify='center'
                  style={{ marginBottom: '15px' }}
                >
                  <Spinner size='large' />
                </Row>
                <Row
                  gap={0.8}
                  justify='center'
                  style={{ marginBottom: '15px' }}
                >
                  <Text>Loading safe</Text>
                </Row>
              </div>
            ) : (
              <>
                {/* <div className={classes.content}>
                  <div className={classes.name}>
                    <div className={classes.title}>
                      <Text h2 className={classes.username}>
                        {safeData.creator}
                      </Text>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Icons.Mail size={16} aria-label='Email' />
                        <Text className={classes.integrationsUsername}>
                          {safeData.email}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div> */}
              
                    <div className={classes.projects}>
                      <Card shadow className={classes.card}>
                        <div>
                          <div className={classes.dot}>
                            {/* <img
                              className={classes.logo}
                              src={`/assets/${portfolio.chain}.svg`}
                              alt=''
                              srcset=''
                            /> */}
                            { showSafe ?
                            <>
                            <Snippet text={safeData.data}  width="300px" /> 
                            <Button auto type='success' size='mini' onClick={()=>{setSafeShow(false)}} >
                            Hide
                           </Button>
                            </>
                            :
                            <>
                            <Snippet text={"******"}  copy="prevent"  width="300px" /> 
                            <Button auto type='success' size='mini' onClick={()=>{setSafeShow(true)}} >
                            Show
                            </Button>
                            </>
                             }
                            
                         
                          </div>
                        </div>
                      </Card>
                    </div>

              </>
            )}
          </div>
        </Modal.Content>
        <Modal.Action passive onClick={() => setModal(false)}>
          Cancel
        </Modal.Action>
      </Modal>
    </>
  );
}

export default Safe;
