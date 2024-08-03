import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentDocState,
  docsState,
  sharedDocsState,
  sharedWithUsers,
} from "../atom";
import { useCallback, useState } from "react";

const LOCALHOST = "http://localhost:8000";

const useGetUserDocs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDocsState = useSetRecoilState(docsState);

  const getUserDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await axios.get(`${LOCALHOST}/api/docs/`, {
        withCredentials: true,
      });
      setDocsState(docs.data.docs);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [setDocsState]);

  return { getUserDocs, loading, error };
};

const useGetSharedDocs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDocsState = useSetRecoilState(sharedDocsState);

  const getSharedDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await axios.get(`${LOCALHOST}/api/docs/shared/`, {
        withCredentials: true,
      });
      setDocsState(docs.data.docs);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [setDocsState]);

  return { getSharedDocs, loading, error };
};

const useCreateDoc = () => {
  const setCurrentDocState = useSetRecoilState(currentDocState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createDoc = async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await axios.post(
        `${LOCALHOST}/api/docs/`,
        {
          title: "Untitled Document",
          content: "",
        },
        { withCredentials: true }
      );
      setCurrentDocState(doc.data.doc);
      return doc.data.doc;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  return { createDoc, loading, error };
};

const useDeleteDoc = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteDoc = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${LOCALHOST}/api/docs/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  return { deleteDoc, loading, error };
};

const useGetDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentDoc = useSetRecoilState(currentDocState);

  const getDocument = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${LOCALHOST}/api/docs/${id}`, {
          withCredentials: true,
        });
        const doc = response.data.doc;
        setCurrentDoc(doc);
        return doc;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentDoc]
  );

  return { getDocument, loading, error };
};

const useSaveDocChanges = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentDoc = useRecoilValue(currentDocState);

  const saveDocChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(
        `${LOCALHOST}/api/docs/${currentDoc.id}`,
        {
          title: currentDoc.title,
          content: currentDoc.content,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { saveDocChanges, loading, error };
};

const useGetCollaborators = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCollaborators = useSetRecoilState(sharedWithUsers);

  const getCollaborators = useCallback(
    async (docId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${LOCALHOST}/api/docs/${docId}/shared/`,
          {
            withCredentials: true,
          }
        );
        setCollaborators(response.data.sharedWith);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [setCollaborators]
  );

  return { getCollaborators, loading, error };
};

const useAddCollaborator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCollaborator = async (docId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(
        `${LOCALHOST}/api/docs/${docId}/${email}/`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { addCollaborator, loading, error };
};

const useRemoveCollaborator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeCollaborator = async (docId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${LOCALHOST}/api/docs/${docId}/${email}/`, {
        withCredentials: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { removeCollaborator, loading, error };
};

export {
  useGetUserDocs,
  useCreateDoc,
  useGetDocument,
  useSaveDocChanges,
  useDeleteDoc,
  useGetCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
  useGetSharedDocs,
};
